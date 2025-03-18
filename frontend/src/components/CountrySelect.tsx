import React, { useState, useRef, useEffect } from 'react';
import ReactCountryFlag from 'react-country-flag';

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  countries: Country[];
  required?: boolean;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, countries, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = countries.find(c => c.code === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="appearance-none block w-full pl-10 pr-10 py-2.5 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200 bg-white cursor-pointer"
      >
        <div className="flex items-center">
          <ReactCountryFlag
            countryCode={value}
            svg
            style={{
              width: '1.5em',
              height: '1.5em',
            }}
            title={selectedCountry?.name}
          />
          <span className="ml-2">{selectedCountry?.name} ({selectedCountry?.dialCode})</span>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
          {countries.map((country) => (
            <div
              key={country.code}
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
              className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                country.code === value ? 'bg-indigo-50' : ''
              }`}
            >
              <ReactCountryFlag
                countryCode={country.code}
                svg
                style={{
                  width: '1.5em',
                  height: '1.5em',
                }}
                title={country.name}
              />
              <span className="ml-2">{country.name} ({country.dialCode})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelect; 