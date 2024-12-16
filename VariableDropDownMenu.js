import React, { useEffect, useState } from "react";
import styles from "../apiCs/VariableDropDown.module.css";
import axios from "axios";

export default function VariableDropDownApiMenu({ isOpen, position, onSelect }) {
  const [variables, setVariableList] = useState([]);

  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/variables/getVariables`, {
          withCredentials: true
        });
        setVariableList(response.data);
      } catch (err) {
        console.error('Error fetching variables:', err);
      }
    };
    fetchVariables();
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{ position: "absolute", ...position }}>
      <div className={styles.dropdownMenu}>
        <ul className={styles.dropdownList}>
          {variables.length > 0 ? (
            variables.map((variable, index) => (
              <li
                key={index}
                className={styles.dropdownItem}
                onClick={() => onSelect?.(variable)}
              >
                <div className={styles.variableInfo}>
                  <span className={styles.variableName}>{variable.displayName}</span>
                  <span className={styles.variableDetails}>
                    {variable.name} - {variable.category}
                  </span>
                </div>
                <span className={styles.variableType}>{variable.type}</span>
              </li>
            ))
          ) : (
            <li className={styles.noResults}>No variables found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
