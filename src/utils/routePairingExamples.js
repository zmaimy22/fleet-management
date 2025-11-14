/**
 * ROUTE PAIRING SYSTEM - PRACTICAL EXAMPLES
 * 
 * نظام ربط الروتات - أمثلة عملية
 */

/**
 * مثال 1: توليد جدول يوضح الربط الصحيح
 */
export function exampleCorrectPairing() {
  const example = {
    title: '✅ مثال صحيح - ربط صحيح',
    description: 'R2 و R2.2 معاً عند نفس الموصل في نفس اليوم',
    
    scenario: {
      drivers: [
        { id: 2, name: 'JULIAN ronaldo' },
        { id: 5, name: 'SERGIO gavi' },
        { id: 6, name: 'J.HARRISON cuba' }
      ],
      routes: ['R2', 'R2.2'],
      month: 'Noviembre 2024'
    },

    schedule: {
      day1: {
        driver_2: {
          type: 'work',
          value: 'R2+R2.2',  // ✅ AMBAS JUNTAS
          explanation: 'JULIAN maneja R2 Y R2.2 en el mismo día'
        },
        driver_5: {
          type: 'weekend',
          value: '',
          explanation: 'SERGIO descansa'
        },
        driver_6: {
          type: 'weekend',
          value: '',
          explanation: 'J.HARRISON descansa'
        }
      },

      day2: {
        driver_2: {
          type: 'weekend',
          value: '',
          explanation: 'JULIAN descansa (patrón 4/2)'
        },
        driver_5: {
          type: 'work',
          value: 'R2+R2.2',  // ✅ AMBAS JUNTAS
          explanation: 'SERGIO maneja R2 Y R2.2 en el mismo día'
        },
        driver_6: {
          type: 'work',
          value: '',
          explanation: 'J.HARRISON trabaja (sin ruta asignada)'
        }
      },

      day3: {
        driver_2: {
          type: 'weekend',
          value: '',
          explanation: 'JULIAN descansa (día 2 del descanso)'
        },
        driver_5: {
          type: 'work',
          value: 'R2+R2.2',  // ✅ AMBAS JUNTAS
          explanation: 'SERGIO maneja R2 Y R2.2 en el mismo día'
        },
        driver_6: {
          type: 'work',
          value: '',
          explanation: 'J.HARRISON trabaja (sin ruta asignada)'
        }
      }
    },

    rules: [
      '✅ R2 y R2.2 están SIEMPRE en la misma celda',
      '✅ Mismo conductor maneja ambas',
      '✅ Mismo día',
      '✅ Formato: "R2+R2.2" en el calendario'
    ]
  };

  return example;
}

/**
 * مثال 2: توليد جدول يوضح الخطأ الشائع
 */
export function exampleIncorrectPairing() {
  const example = {
    title: '❌ مثال خاطئ - ربط مفكك',
    description: 'R2 و R2.2 لموصلين مختلفين أو أيام مختلفة',
    
    scenario: {
      drivers: [
        { id: 2, name: 'JULIAN ronaldo' },
        { id: 5, name: 'SERGIO gavi' },
        { id: 6, name: 'J.HARRISON cuba' }
      ],
      routes: ['R2', 'R2.2'],
      month: 'Noviembre 2024'
    },

    schedule: {
      day1: {
        driver_2: {
          type: 'work',
          value: 'R2',      // ❌ فقط R2
          explanation: 'JULIAN يعمل في R2 فقط',
          problem: 'R2.2 غير موجودة!'
        },
        driver_5: {
          type: 'work',
          value: 'R2.2',    // ❌ R2.2 بدون R2
          explanation: 'SERGIO يعمل في R2.2 فقط',
          problem: 'R2.2 يجب أن تكون مع R2، ليست حتى موجودة!'
        },
        driver_6: {
          type: 'work',
          value: '',
          explanation: 'J.HARRISON يعمل لكن بدون روتا'
        }
      }
    },

    problems: [
      '❌ R2 و R2.2 مع موصلين مختلفين',
      '❌ مفصولة في أيام مختلفة',
      '❌ الهيكل المنطقي للروتا مكسور',
      '❌ يصعب على الموصل فهم المسار'
    ],

    whatWentWrong: [
      'تم تعيين R2 لموصل واحد',
      'تم تعيين R2.2 لموصل مختلف',
      'لم يتم احترام علاقة "الروتا الثانوية" بـ "الرئيسية"'
    ]
  };

  return example;
}

/**
 * مثال 3: توليد جدول مع حالات متقدمة
 */
export function exampleAdvancedPairing() {
  const example = {
    title: '🔧 مثال متقدم - روتات متعددة',
    description: 'مجموعة مع عدة روتات (R1+R1.1 و R2+R2.2)',
    
    scenario: {
      drivers: [
        { id: 1, name: 'ATILA badi' },
        { id: 2, name: 'minarman' },
        { id: 3, name: 'GUSTAVO ramos' }
      ],
      routes: ['R1', 'R1.1', 'R2', 'R2.2'],
      groups: [
        { name: 'Group 1', routes: ['R1', 'R1.1'], drivers: [1, 2, 3] },
        { name: 'Group 2', routes: ['R2', 'R2.2'], drivers: [1, 2, 3] }
      ],
      month: 'Noviembre 2024'
    },

    schedule: {
      day1: {
        driver_1: {
          type: 'work',
          value: 'R1+R1.1',  // ✅ PAREJA 1
          explanation: 'ATILA maneja R1 y R1.1 juntas'
        },
        driver_2: {
          type: 'weekend',
          value: '',
          explanation: 'minarman descansa'
        },
        driver_3: {
          type: 'weekend',
          value: '',
          explanation: 'GUSTAVO descansa'
        }
      },

      day2: {
        driver_1: {
          type: 'weekend',
          value: '',
          explanation: 'ATILA descansa'
        },
        driver_2: {
          type: 'work',
          value: 'R2+R2.2',  // ✅ PAREJA 2
          explanation: 'minarman maneja R2 y R2.2 juntas'
        },
        driver_3: {
          type: 'work',
          value: '',
          explanation: 'GUSTAVO trabaja (sin ruta en este día)'
        }
      },

      day3: {
        driver_1: {
          type: 'weekend',
          value: '',
          explanation: 'ATILA descansa (día 2)'
        },
        driver_2: {
          type: 'work',
          value: 'R1+R1.1',  // ✅ PAREJA 1 (دورة جديدة)
          explanation: 'minarman maneja R1 y R1.1 juntas (دورة جديدة)'
        },
        driver_3: {
          type: 'work',
          value: 'R2+R2.2',  // ✅ PAREJA 2
          explanation: 'GUSTAVO maneja R2 y R2.2 juntas'
        }
      }
    },

    keyPoints: [
      '✅ كل "رحلة" تحتوي على الرئيسية + الثانوية معاً',
      '✅ يتم توزيع الرحلات على الموصلين بالتناوب',
      '✅ النمط 4/2 محفوظ (4 يوم عمل، 2 يوم راحة)',
      '✅ جميع الروتات مرتبطة ومنظمة'
    ]
  };

  return example;
}

/**
 * مثال 4: التحقق من الصحة
 */
export function exampleValidationChecks() {
  const example = {
    title: '✓ فحوصات الصحة / Validation Checks',
    description: 'كيفية التحقق من أن الربط صحيح',
    
    checks: [
      {
        name: '1. فحص الوجود المقترن',
        rule: 'إذا وجدنا R2 في أي خلية، يجب أن نجد R2.2 أيضاً',
        check: `
          إذا cell.value.includes('R2') {
            يجب أن يكون cell.value.includes('R2.2') أيضاً
          }
        `,
        example: '✅ صحيح: R2+R2.2 | ❌ خاطئ: R2'
      },
      {
        name: '2. فحص التشارك',
        rule: 'R2 و R2.2 يجب أن يكونا في نفس الموصل والنفس اليوم',
        check: `
          const day1_driver1 = schedule[driver1][day1]; // "R2+R2.2"
          const day1_driver2 = schedule[driver2][day1]; // "" (بدون R2 و R2.2)
        `,
        example: '✅ صحيح: نفس الموصل، نفس اليوم | ❌ خاطئ: موصلين مختلفين'
      },
      {
        name: '3. فحص الاكتمال',
        rule: 'كل رحلة رئيسية يجب أن تحتوي على ثانويتها',
        check: `
          mainRoutes = ['R1', 'R2', 'R3', 'R7']
          secondaryToMain = { R1: ['R1.1'], R2: ['R2.2'], R7: ['R7.1'] }
          
          لكل mainRoute:
            إذا كانت موجودة في الجدول:
              يجب أن تكون ثانويتها أيضاً موجودة
        `,
        example: '✅ صحيح: جميع الثانويات موجودة | ❌ خاطئ: ثانوية مفقودة'
      }
    ]
  };

  return example;
}
