import React, { useState } from 'react';
import styles from '../apiCs/UrlParamsComponents.module.css';
import VariableDropDownApiMenu from './VariableDropDownApiMenu';
import { IoCodeSlash, IoTrash } from "react-icons/io5";

/**
 * Created HeadersComponent for managing request headers
 */
export default function HeadersComponent({ headers, onChange }) {
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

    const addHeader = () => {
        onChange([...headers, { key: '', value: '', testValue: '' }]);
    };

    const removeHeader = (index) => {
        const newHeaders = headers.filter((_, i) => i !== index);
        onChange(newHeaders);
        if (openDropdownIndex === index) {
            setOpenDropdownIndex(null);
        }
    };

    const updateHeader = (index, field, value) => {
        if (field === 'key' || field === 'value' || field === 'testValue') {
            const newHeaders = headers.map((header, i) => {
                if (i === index) {
                    return { ...header, [field]: value };
                }
                return header;
            });
            onChange(newHeaders);
        }
    };

    const handleVariableSelect = (index, variable) => {
        const newHeaders = headers.map((header, i) => {
            if (i === index) {
                return { ...header, value: variable.name };
            }
            return header;
        });
        onChange(newHeaders);
        setOpenDropdownIndex(null);
    };

    const toggleDropdown = (index) => {
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };

    return (
        <div>
            <div className={styles.addParamsContainer}>
                <button onClick={addHeader} className={styles.addParamsButton}>
                    Add Header
                </button>
            </div>

            {headers.map((header, index) => (
                <div key={index} className={styles.urlParamBox}>
                    <input
                        type="text"
                        placeholder="Key"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        className={styles.urlInput}
                    />

                    <div className={styles.ValueInputBox}>
                        <input
                            type="text"
                            placeholder="Value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                            className={styles.urlInput}
                        />

                        <IoCodeSlash 
                            className={styles.variableButton}
                            onClick={() => toggleDropdown(index)} 
                        />

                        {openDropdownIndex === index && (
                            <VariableDropDownApiMenu 
                                isOpen={true}
                                position={{ 
                                    top: "100%", 
                                    right: "-50%", 
                                    transform: "translateX(-40%)" 
                                }}
                                onSelect={(variable) => handleVariableSelect(index, variable)}
                            />
                        )}
                    </div>

                    <input
                        type="text"
                        placeholder="Test Value"
                        value={header.testValue}
                        onChange={(e) => updateHeader(index, 'testValue', e.target.value)}
                        className={styles.urlInput}
                    />

                    <IoTrash 
                        className={styles.deleteButton}
                        onClick={() => removeHeader(index)}
                    />
                </div>
            ))}
        </div>
    );
}
