import React, { useEffect, useState } from "react";

interface OptionType {
  createdAt: string;
  id: number;
  name: string;
  updatedAt: string;
  workspaceId: number;
}

interface SelectProps {
  options?: OptionType[];
  onChange: (id: number) => void; // Update type here
  placeholder?: string;
  addBtnText?: string;
  onAddBtnClick?: () => void;
  defaultValue?: string | number; // Update type here
}

const DynamicSelect: React.FC<SelectProps> = ({
  options = [],
  onChange,
  placeholder = "Select",
  addBtnText = "",
  onAddBtnClick,
  defaultValue = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | number>(defaultValue);

  const openSelectHandler = () => {
    setIsOpen(!isOpen);
  };

  const optionSelector = (id: number, name: string) => {
    onChange(id); 
    setSelectedValue(name);
    setIsOpen(false);
  };

  useEffect(() => {
    console.log(defaultValue)
    console.log(typeof defaultValue);
  if(defaultValue !== 0) {
    console.log("zero values")
    const foundObject = options.find((item: OptionType) => item.id === defaultValue);
    if (foundObject) {
      console.log(foundObject)
      onChange(foundObject.id)
      setSelectedValue(foundObject.name);
    } else {
      setSelectedValue(0);
    }
  }else{
    setSelectedValue(0)
  }
  }, [options, defaultValue]);
  

  return (
    <div className="theme-select">
      <div
        className={`theme-select-selected ${isOpen ? "open" : ""}`}
        onClick={openSelectHandler}
      >
        {selectedValue === 0 ? placeholder : selectedValue}
      </div>
      <ul className={`theme-select-option ${!isOpen ? "d-none" : ""}`}>
        {addBtnText !== "" && <li onClick={onAddBtnClick}>{addBtnText}</li>}
        {options.map((option) => (
          <li
            key={option.name}
            onClick={() => optionSelector(option.id, option.name)}
            className={`${option.name === selectedValue ? "selected" : ""}`}
          >
            {option.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DynamicSelect;
