import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import '../Styles/LanguageFilter.css';

type Language = 'all' | 'es' | 'en';

interface LanguageFilterProps {
    value: Language;
    onChange: (lang: Language) => void;
}

const OPTIONS: { value: Language; label: string; icon?: React.ReactNode }[] = [
    { value: 'all', label: 'Todos los idiomas', icon: <Globe size={14} /> },
    { value: 'es',  label: '🇪🇸 Español' },
    { value: 'en',  label: '🇺🇸 English' },
];

const LanguageFilter: React.FC<LanguageFilterProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = OPTIONS.find(o => o.value === value);

    return (
        <div className="lang-filter" ref={ref}>
            <button
                type="button"
                className="lang-filter__trigger"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <div className="lang-filter__trigger-content">
                    {selected?.icon && (
                        <span className="lang-filter__trigger-icon">{selected.icon}</span>
                    )}
                    <span className="lang-filter__text">{selected?.label}</span>
                </div>
                <span className={`lang-filter__chevron ${isOpen ? 'lang-filter__chevron--open' : ''}`}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>

            {isOpen && (
                <div className="lang-filter__dropdown">
                    <div className="lang-filter__options">
                        {OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                className={`lang-filter__option ${value === opt.value ? 'lang-filter__option--selected' : ''}`}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            >
                                <div className="lang-filter__option-content">
                                    {opt.icon && (
                                        <span className="lang-filter__option-icon">{opt.icon}</span>
                                    )}
                                    <span className="lang-filter__option-text">{opt.label}</span>
                                </div>
                                {value === opt.value && (
                                    <span className="lang-filter__check">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageFilter;
