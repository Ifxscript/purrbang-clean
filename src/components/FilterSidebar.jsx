import { useState } from 'react';
import { X, Search, ChevronUp, ChevronDown, Check } from 'lucide-react';
import './FilterSidebar.css';

function FilterSidebar({ isOpen, onClose, filters, traitOptions, onFilterChange, onClearFilters, activeFiltersCount }) {
    const [expandedTraits, setExpandedTraits] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    const toggleTrait = (trait) => {
        setExpandedTraits(prev => ({
            ...prev,
            [trait]: !prev[trait]
        }));
    };

    const getTraitCount = (trait) => {
        return traitOptions[trait]?.length || 0;
    };

    // Filter options within a trait category
    const filterOptions = (trait) => {
        const options = traitOptions[trait] || [];
        if (!searchQuery) return options;
        return options.filter(opt =>
            opt.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // Check if a category should be visible based on search
    const isCategoryVisible = (trait) => {
        if (!searchQuery) return true;

        // Check if category name matches
        const categoryMatches = trait.toLowerCase().includes(searchQuery.toLowerCase());
        if (categoryMatches) return true;

        // Check if any options match
        const options = traitOptions[trait] || [];
        return options.some(opt =>
            opt.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // Check if category should be auto-expanded (has matching options)
    const shouldAutoExpand = (trait) => {
        if (!searchQuery) return false;
        return isCategoryVisible(trait);
    };

    // Determine if trait is expanded (manually or auto)
    const isTraitExpanded = (trait) => {
        if (searchQuery && shouldAutoExpand(trait)) return true;
        return expandedTraits[trait];
    };

    return (
        <aside className="filter-sidebar">
            <div className="filter-sidebar__header">
                <h2 className="filter-sidebar__title">Traits</h2>
                <button className="filter-sidebar__close" onClick={onClose}><X size={18} /></button>
            </div>

            {/* Search Box */}
            <div className="filter-sidebar__search">
                <Search size={14} className="filter-sidebar__search-icon" />
                <input
                    type="text"
                    className="filter-sidebar__search-input"
                    placeholder="Search Traits"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Trait Accordion List */}
            <div className="filter-sidebar__traits">
                {Object.keys(filters).map(trait => {
                    // Skip categories that don't match search
                    if (!isCategoryVisible(trait)) return null;

                    const isExpanded = isTraitExpanded(trait);
                    const options = filterOptions(trait);
                    const selectedValue = filters[trait];

                    return (
                        <div key={trait} className="filter-sidebar__trait">
                            <button
                                className={`filter-sidebar__trait-header ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleTrait(trait)}
                            >
                                <span className="filter-sidebar__trait-name">
                                    {trait.charAt(0).toUpperCase() + trait.slice(1)}
                                </span>
                                <span className="filter-sidebar__trait-info">
                                    <span className="filter-sidebar__trait-count">{getTraitCount(trait)}</span>
                                    <span className="filter-sidebar__chevron">{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="filter-sidebar__options">
                                    {/* All option */}
                                    <button
                                        className={`filter-sidebar__option ${!selectedValue ? 'selected' : ''}`}
                                        onClick={() => onFilterChange(trait, '')}
                                    >
                                        <span className="filter-sidebar__checkbox">
                                            {!selectedValue && <Check size={10} />}
                                        </span>
                                        <span className="filter-sidebar__option-name">All</span>
                                    </button>

                                    {options.map(value => (
                                        <button
                                            key={value}
                                            className={`filter-sidebar__option ${selectedValue === value ? 'selected' : ''}`}
                                            onClick={() => onFilterChange(trait, value)}
                                        >
                                            <span className="filter-sidebar__checkbox">
                                                {selectedValue === value && <Check size={10} />}
                                            </span>
                                            <span className="filter-sidebar__option-name">{value}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}

export default FilterSidebar;
