'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

export default function SelectField({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  disabled,
  error
}) {
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <Listbox.Button className={`
          relative w-full pl-11 pr-10 py-3 text-left 
          bg-black/50 backdrop-blur-xl 
          border ${error ? 'border-red-500' : 'border-[#ff0080]/20'} 
          rounded-lg text-white 
          focus:outline-none focus:border-[#ff0080] focus:ring-1 focus:ring-[#ff0080] 
          transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}>
          {Icon && (
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-[#ff0080]" />
            </span>
          )}
          <span className={`block truncate ${!value ? 'text-gray-400' : 'text-white'}`}>
            {value || placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-[#ff0080]"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-black/90 backdrop-blur-xl border border-[#ff0080]/20 py-1 text-base shadow-lg focus:outline-none sm:text-sm">
            {options.map((option, index) => (
              <Listbox.Option
                key={index}
                className={({ active }) => `
                  relative cursor-pointer select-none py-2 pl-11 pr-4
                  ${active ? 'bg-[#ff0080]/20 text-white' : 'text-gray-300'}
                `}
                value={option.value || option}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium text-[#ff0080]' : ''}`}>
                      {option.label || option}
                    </span>
                    {Icon && selected && (
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#ff0080]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
