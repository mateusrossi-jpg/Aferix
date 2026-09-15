// Transpilador CLP-Fácil -> ENDAP Firmware (ESP32 C-Struct / Bytecode)
// Ponte direta entre Pilar 1 (CLP-Fácil) e Pilar 2 (ENDAP Firmware)

import { LadderProgram } from './types';

export function generateEndapFirmwareCHeader(program: LadderProgram): string {
  const timestamp = new Date().toISOString();
  
  let cCode = `/**
 * ====================================================================
 * ENDAP FIRMWARE - PROGRAMA LADDER COMPILADO VIA CLP-FÁCIL
 * Data de Geração: ${timestamp}
 * Programa: ${program.name}
 * Rungs: ${program.rungs.length}
 * 
 * ALERTA DE SEGURANÇA ELÉTRICA:
 * - Boot com GPIOs em estado seguro de repouso (desenergizados).
 * - Watchdog timer ativo com ciclo determinístico de 10ms.
 * ====================================================================
 */

#ifndef ENDAP_LADDER_PROGRAM_H
#define ENDAP_LADDER_PROGRAM_H

#include <stdint.h>
#include <stdbool.h>

typedef enum {
    INSTR_NOP = 0x00,
    INSTR_LD = 0x01,       // Carrega contato NA
    INSTR_LD_NOT = 0x02,   // Carrega contato NF
    INSTR_AND = 0x03,      // E em série NA
    INSTR_AND_NOT = 0x04,  // E em série NF
    INSTR_OR = 0x05,       // OU em paralelo NA
    INSTR_OR_NOT = 0x06,   // OU em paralelo NF
    INSTR_OUT = 0x10,      // Bobina Simples
    INSTR_OUT_NOT = 0x11,  // Bobina Negada
    INSTR_SET = 0x12,      // Bobina Set (Latch)
    INSTR_RESET = 0x13,    // Bobina Reset (Unlatch)
    INSTR_TON = 0x20,      // Temporizador On-Delay
    INSTR_TOF = 0x21       // Temporizador Off-Delay
} endap_opcode_t;

typedef enum {
    VAR_TYPE_INPUT = 0x01,  // %I0.X
    VAR_TYPE_OUTPUT = 0x02, // %Q0.X
    VAR_TYPE_MEMORY = 0x03, // %M0.X
    VAR_TYPE_TIMER = 0x04   // T0..T3
} endap_var_type_t;

typedef struct {
    endap_opcode_t opcode;
    endap_var_type_t var_type;
    uint8_t index;       // 0 a 7
    uint16_t param_ms;   // Para temporizadores TON/TOF
} endap_instruction_t;

// Tabela de instruções Ladder para execução determinística no ESP-IDF FreeRTOS
static const endap_instruction_t ENDAP_COMPILED_LOGIC[] = {
`;

  program.rungs.forEach((rung, rIdx) => {
    cCode += `    // --- RUNG ${rIdx}: ${rung.comment || rung.id} ---\n`;
    
    rung.branches.forEach((branch, bIdx) => {
      branch.elements.forEach((el, eIdx) => {
        let op = 'INSTR_AND';
        if (bIdx === 0 && eIdx === 0) {
          op = el.type === 'contact_nc' ? 'INSTR_LD_NOT' : 'INSTR_LD';
        } else if (eIdx === 0) {
          op = el.type === 'contact_nc' ? 'INSTR_OR_NOT' : 'INSTR_OR';
        } else {
          op = el.type === 'contact_nc' ? 'INSTR_AND_NOT' : 'INSTR_AND';
        }

        let varType = 'VAR_TYPE_INPUT';
        let bitIndex = 0;

        if (el.address.startsWith('%I')) {
          varType = 'VAR_TYPE_INPUT';
          bitIndex = parseInt(el.address.replace('%I0.', ''), 10) || 0;
        } else if (el.address.startsWith('%Q')) {
          varType = 'VAR_TYPE_OUTPUT';
          bitIndex = parseInt(el.address.replace('%Q0.', ''), 10) || 0;
        } else if (el.address.startsWith('%M')) {
          varType = 'VAR_TYPE_MEMORY';
          bitIndex = parseInt(el.address.replace('%M0.', ''), 10) || 0;
        } else if (el.address.startsWith('T')) {
          varType = 'VAR_TYPE_TIMER';
          bitIndex = parseInt(el.address.replace('T', ''), 10) || 0;
        }

        cCode += `    { ${op}, ${varType}, ${bitIndex}, 0 }, // ${el.address} [${el.tag || ''}]\n`;
      });
    });

    // Saída
    const out = rung.output;
    if (out) {
      let outOp = 'INSTR_OUT';
      if (out.type === 'coil_set') outOp = 'INSTR_SET';
      else if (out.type === 'coil_reset') outOp = 'INSTR_RESET';
      else if (out.type === 'coil_not') outOp = 'INSTR_OUT_NOT';
      else if (out.type === 'ton') outOp = 'INSTR_TON';
      else if (out.type === 'tof') outOp = 'INSTR_TOF';

      let varType = 'VAR_TYPE_OUTPUT';
      let bitIndex = 0;
      let paramMs = 0;

      if (out.address.startsWith('%Q')) {
        varType = 'VAR_TYPE_OUTPUT';
        bitIndex = parseInt(out.address.replace('%Q0.', ''), 10) || 0;
      } else if (out.address.startsWith('%M')) {
        varType = 'VAR_TYPE_MEMORY';
        bitIndex = parseInt(out.address.replace('%M0.', ''), 10) || 0;
      } else if (out.address.startsWith('T')) {
        varType = 'VAR_TYPE_TIMER';
        bitIndex = parseInt(out.address.replace('T', ''), 10) || 0;
        paramMs = Math.round((out.presetTime ?? 5.0) * 1000);
      }

      cCode += `    { ${outOp}, ${varType}, ${bitIndex}, ${paramMs} }, // Saída: ${out.address} [${out.tag || ''}]\n`;
    }
  });

  cCode += `    { INSTR_NOP, 0, 0, 0 } // Fim de ciclo
};

#define ENDAP_INSTRUCTION_COUNT (sizeof(ENDAP_COMPILED_LOGIC) / sizeof(endap_instruction_t))

#endif // ENDAP_LADDER_PROGRAM_H
`;

  return cCode;
}
