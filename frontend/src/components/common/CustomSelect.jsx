import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 현대적이고 세련된 커스텀 Select 컴포넌트
 * Material Design + Fluent Design 스타일
 */
const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = "선택하세요",
  icon: Icon = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // 선택된 옵션 찾기
  const selectedOption = options.find(opt => opt.value === value);

  // 필터링된 옵션
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 드롭다운 열릴 때 검색 입력에 포커스
  useEffect(() => {
    if (isOpen && searchInputRef.current && options.length > 5) {
      searchInputRef.current.focus();
    }
  }, [isOpen, options.length]);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* 선택 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-3
          px-4 py-2.5 rounded-xl
          bg-white border-2 transition-all duration-200
          ${isOpen
            ? 'border-blue-500 shadow-lg shadow-blue-100'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          {Icon && (
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-lg
              ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
              transition-colors duration-200
            `}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className={`
            font-medium truncate
            ${selectedOption ? 'text-gray-900' : 'text-gray-400'}
          `}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`
            w-5 h-5 transition-colors duration-200
            ${isOpen ? 'text-blue-600' : 'text-gray-400'}
          `} />
        </motion.div>
      </button>

      {/* 드롭다운 메뉴 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* 검색 입력 (옵션이 5개 이상일 때만) */}
            {options.length > 5 && (
              <div className="p-3 border-b border-gray-100">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="검색..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* 옵션 리스트 */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                (() => {
                  let currentSection = null;
                  let sectionStarted = false;

                  return filteredOptions.map((option, index) => {
                    const isKorean = option.value.endsWith('_kr');
                    const isEnglish = option.value.endsWith('_en');
                    const isDivider = option.disabled && option.value.startsWith('divider_');

                    // 새로운 섹션 시작
                    if (isDivider) {
                      sectionStarted = false;
                      currentSection = option.value === 'divider_kr' ? 'korean' : 'english';
                      return (
                        <div
                          key={option.value}
                          className="px-4 py-2.5 text-center text-xs font-medium text-gray-400 bg-gray-50 select-none"
                        >
                          {option.label}
                        </div>
                      );
                    }

                    // 섹션 배경색
                    const sectionBg = currentSection === 'korean' ? 'bg-blue-100/60' : currentSection === 'english' ? 'bg-amber-100/60' : '';

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleSelect(option)}
                        className={`
                          w-full flex items-center justify-between gap-3
                          px-4 py-3 text-left transition-all duration-150
                          ${sectionBg}
                          ${option.value === value
                            ? isKorean
                              ? 'bg-blue-200 text-blue-900 font-medium'
                              : isEnglish
                              ? 'bg-amber-200 text-amber-900 font-medium'
                              : 'bg-blue-50 text-blue-700 font-medium'
                            : isKorean || isEnglish
                            ? 'hover:bg-white/50 text-gray-700'
                            : 'hover:bg-gray-50 text-gray-700'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="truncate">{option.label}</span>
                        </div>
                        {option.value === value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Check className={`w-5 h-5 ${isEnglish ? 'text-amber-700' : 'text-blue-700'}`} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  });
                })()
              ) : (
                <div className="px-4 py-8 text-center text-gray-400">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
