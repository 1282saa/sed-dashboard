import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 날짜 범위 선택 컴포넌트
 */
const DateRangePicker = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const pickerRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // value 파싱
  useEffect(() => {
    if (value && value !== 'all') {
      if (value.includes('~')) {
        const [start, end] = value.split('~');
        setStartDate(new Date(start));
        setEndDate(new Date(end));
      } else {
        // 단일 월 선택 (YYYY-MM 형식)
        const [year, month] = value.split('-').map(Number);
        setStartDate(new Date(year, month - 1, 1));
        setEndDate(new Date(year, month, 0));
      }
    }
  }, [value]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handleDateClick = (date) => {
    if (!startDate || (startDate && endDate)) {
      // 새로운 범위 시작
      setStartDate(date);
      setEndDate(null);
    } else {
      // 범위 완성
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const formatDateRange = () => {
    if (value === 'all') return '전체 기간';
    if (!startDate) return '기간 선택';

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (!endDate) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  const isDateInRange = (date) => {
    if (!startDate) return false;
    if (!endDate && !hoveredDate) return date.getTime() === startDate.getTime();

    const compareDate = endDate || hoveredDate;
    const start = startDate < compareDate ? startDate : compareDate;
    const end = startDate < compareDate ? compareDate : startDate;

    return date >= start && date <= end;
  };

  const isDateStart = (date) => {
    if (!startDate) return false;
    return date.getTime() === startDate.getTime();
  };

  const isDateEnd = (date) => {
    if (!endDate) return false;
    return date.getTime() === endDate.getTime();
  };

  const applyRange = () => {
    if (startDate && endDate) {
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      onChange(`${formatDate(startDate)}~${formatDate(endDate)}`);
      setIsOpen(false);
    }
  };

  const clearRange = () => {
    setStartDate(null);
    setEndDate(null);
    onChange('all');
  };

  const selectAllTime = () => {
    onChange('all');
    setIsOpen(false);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-3
          px-4 py-2.5 rounded-xl
          bg-white border-2 transition-all duration-200
          ${isOpen
            ? 'border-purple-500 shadow-lg shadow-purple-100'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        `}
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-lg
            ${isOpen ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}
            transition-colors duration-200
          `}>
            <Calendar className="w-4 h-4" />
          </div>
          <span className="font-medium truncate text-gray-900">
            {formatDateRange()}
          </span>
        </div>

        {value !== 'all' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearRange();
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 min-w-[320px]"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="font-semibold text-gray-900">
                {year}년 {monthNames[month]}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* 요일 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const isInRange = isDateInRange(date);
                const isStart = isDateStart(date);
                const isEnd = isDateEnd(date);
                const isToday = new Date().toDateString() === date.toDateString();

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm
                      transition-all duration-150
                      ${isStart || isEnd
                        ? 'bg-purple-600 text-white font-semibold shadow-md'
                        : isInRange
                        ? 'bg-purple-100 text-purple-700'
                        : isToday
                        ? 'bg-gray-100 font-semibold'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={selectAllTime}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                전체 기간
              </button>
              <button
                onClick={applyRange}
                disabled={!startDate || !endDate}
                className={`
                  flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${startDate && endDate
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                적용
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangePicker;
