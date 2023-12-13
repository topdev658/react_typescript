import React, { useState, useEffect } from "react";

interface OptionType {
  value: number;
  label: string;
  image?: string;
  editable?: boolean;
}

interface SelectProps {
  options?: OptionType[];
  onChange: (value: string) => void;
  placeholder?: string;
  addBtnText?: string;
  defaultSelectedValue?: string;
  onAddBtnClick?: () => void;
  onEditBtnClick?: () => void;
}

const Select: React.FC<SelectProps> = ({
  options = [],
  onChange,
  placeholder = "Select",
  addBtnText = "",
  onAddBtnClick,
  onEditBtnClick,
  defaultSelectedValue = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(defaultSelectedValue);

  const openSelectHandler = () => {
    setIsOpen(!isOpen);
  };

  const optionSelector = (value: number, label: string) => {
    onChange(label);
    setSelectedValue(label);
    setIsOpen(false);
  };

  useEffect(() => {
    // Update selectedValue when defaultSelectedValue changes
    setSelectedValue(defaultSelectedValue || "");
  }, [defaultSelectedValue]);

  return (
    <div className="theme-select">
      <div
        className={`theme-select-selected ${isOpen ? "open" : ""}`}
        onClick={openSelectHandler}
      >
        {selectedValue === "" ? placeholder : selectedValue}
      </div>
      <ul className={`theme-select-option ${!isOpen ? "d-none" : ""}`}>
        {addBtnText !== "" && <li onClick={onAddBtnClick}>{addBtnText}</li>}
        {options.map((option) => (
          <li
            key={option.value}
            onClick={() => optionSelector(option.value, option.label)}
            className={`${option.label === selectedValue ? "selected" : ""}`}
          >
            {option?.image && <img src={option?.image} alt="" />}
            {option.label}
            {option?.editable && (
              <button type="button" onClick={onEditBtnClick}>
                <i className="icon-edit-2"></i>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Select;
