import React, { useState, useRef, useEffect } from 'react';
import styles from '../apiCs/BodyComponent.module.css';
import VariableDropDownApiMenu from './VariableDropDownApiMenu';
import { IoCodeSlash } from "react-icons/io5";
import Editor from "@monaco-editor/react";

export default function BodyComponent({ body, onChange }) {
  const [bodyType, setBodyType] = useState(body?.type || "none");
  const [selectedDropDownField, setSelectedDropDownField] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
  const editorRef = useRef(null);
  const [bodyDataStore, setBodyDataStore] = useState({
    raw: body?.type === 'raw' ? body.bodyData : [],
    'multipart/form-data': body?.type === 'multipart/form-data' ? body.bodyData : [],
    'x-www-form-urlencoded': body?.type === 'x-www-form-urlencoded' ? body.bodyData : []
  });

  useEffect(() => {
    // Update bodyDataStore when body prop changes
    if (body?.type && body.bodyData) {
      setBodyDataStore(prev => ({
        ...prev,
        [body.type]: body.bodyData
      }));
    }
  }, [body]);

  const handleBodyTypeChange = (newType) => {
    setBodyType(newType);
    // Use stored data for the new type or empty array if none exists
    onChange({
      type: newType,
      bodyData: bodyDataStore[newType] || []
    });
  };

  const handleFormDataChange = (index, field, value) => {
    const newBodyData = [...(body?.bodyData || [])];
    
    if (!newBodyData[index]) {
      newBodyData[index] = { key: "", value: "", testValue: "" };
    }
    
    newBodyData[index] = { ...newBodyData[index], [field]: value };

    if (index === newBodyData.length - 1 && value.trim() !== "") {
      newBodyData.push({ key: "", value: "", testValue: "" });
    }

    // Update both the parent and our local store
    setBodyDataStore(prev => ({
      ...prev,
      [bodyType]: newBodyData
    }));

    onChange({
      type: bodyType,
      bodyData: newBodyData
    });
  };

  const handleRawBodyChange = (rawValue) => {
    try {
      const parsedJson = JSON.parse(rawValue);
      const structuredData = Object.entries(parsedJson).map(([key, value]) => ({
        key,
        value: value.toString(),
        testValue: ""
      }));

      // Update both the parent and our local store
      setBodyDataStore(prev => ({
        ...prev,
        raw: structuredData
      }));

      onChange({
        type: "raw",
        bodyData: structuredData
      });
    } catch (e) {
      // Even if JSON is invalid, store the raw value
      const rawData = [{
        value: rawValue
      }];

      setBodyDataStore(prev => ({
        ...prev,
        raw: rawData
      }));

      onChange({
        type: "raw",
        bodyData: rawData
      });
    }
  };

  const getRawValue = () => {
    if (!body?.bodyData) return "";
    
    if (body.bodyData.length > 0 && body.bodyData[0].key) {
      const jsonObj = {};
      body.bodyData.forEach(item => {
        if (item.key) {
          try {
            jsonObj[item.key] = item.value;
          } catch (e) {
            // Skip invalid entries
          }
        }
      });
      return JSON.stringify(jsonObj, null, 2);
    }
    
    return body.bodyData[0]?.value || "";
  };

  const handleRawVariableSelect = (variable) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const selection = editor.getSelection();
    const position = selection.getStartPosition();
    const model = editor.getModel();
    const lineContent = model.getLineContent(position.lineNumber);
    const beforeCursor = lineContent.substring(0, position.column - 1);
    
    let variableToInsert = variable.name;
    
    // Check if we're in a value position
    const isValuePosition = beforeCursor.trim().endsWith(':') || 
                          beforeCursor.trim().endsWith('": ') || 
                          beforeCursor.trim().endsWith('":');

    // Check if we're inside quotes
    const isInsideQuotes = (() => {
      let quoteCount = 0;
      for (let i = 0; i < beforeCursor.length; i++) {
        if (beforeCursor[i] === '"' && (i === 0 || beforeCursor[i-1] !== '\\')) {
          quoteCount++;
        }
      }
      return quoteCount % 2 === 1;
    })();

    if (!isInsideQuotes && isValuePosition) {
      variableToInsert = `"${variable.name}"`;
    }

    editor.executeEdits('insert-variable', [{
      range: selection,
      text: variableToInsert,
      forceMoveMarkers: true
    }]);

    // Focus back on editor
    editor.focus();
    setSelectedDropDownField(null);
  };

  const renderFormFields = () => (
    <div className={styles.fieldsContainer}>
      {(bodyDataStore[bodyType] || [{ key: "", value: "", testValue: "" }]).map((field, index) => (
        <div key={index} className={styles.fieldRow}>
          <input
            type="text"
            placeholder="Key"
            className={styles.inputField}
            value={field.key || ""}
            onChange={(e) => handleFormDataChange(index, "key", e.target.value)}
          />
          
          <div className={styles.formDataVariableInputWrapper}>
            <input
              type="text"
              placeholder="Value"
              className={styles.inputField}
              value={field.value || ""}
              onChange={(e) => handleFormDataChange(index, "value", e.target.value)}
            />
            <IoCodeSlash 
              className={styles.formDataHtmlCodeIcon}
              onClick={() => setSelectedDropDownField(index)}
            />
            {selectedDropDownField === index && (
              <VariableDropDownApiMenu
                onSelect={(variable) => {
                  const newValue = field.value + variable.name;
                  handleFormDataChange(index, "value", newValue);
                }}
                style={{ top: '100%', right: 0 }}
              />
            )}
          </div>

          <input
            type="text"
            placeholder="Test Value"
            className={styles.inputField}
            value={field.testValue || ""}
            onChange={(e) => handleFormDataChange(index, "testValue", e.target.value)}
          />
        </div>
      ))}
    </div>
  );

  const renderRawBody = () => (
    <div className={styles.rawBodyAndTestBodyWrapper}>
      <div className={styles.rawContainer}>
        <Editor
          height="300px"
          defaultLanguage="json"
          defaultValue={getRawValue()}
          value={getRawValue()}
          onChange={handleRawBodyChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: "'Source Code Pro', Consolas, monospace",
            lineNumbers: 'on',
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: 'full',
            tabSize: 2,
            wordWrap: 'on',
            bracketPairColorization: {
              enabled: true,
            },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            padding: {
              top: 12,
              bottom: 12
            },
            folding: true,
            links: true,
            renderLineHighlight: 'line',
            fixedOverflowWidgets: true
          }}
          onMount={(editor, monaco) => {
            editorRef.current = editor;

            monaco.editor.defineTheme('custom-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'keyword', foreground: '569CD6' },
                { token: 'delimiter', foreground: 'D4D4D4' }
              ],
              colors: {
                'editor.background': '#1E1E1E',
                'editor.foreground': '#D4D4D4',
                'editor.lineHighlightBackground': '#2A2A2A',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#C6C6C6',
                'editor.selectionBackground': '#264F78',
                'editor.inactiveSelectionBackground': '#3A3D41'
              }
            });

            monaco.editor.setTheme('custom-dark');

            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
              validate: true,
              allowComments: true,
              schemas: [{
                uri: "http://json-schema.org/draft-07/schema#",
                fileMatch: ["*"],
                schema: {
                  type: "object",
                  properties: {}
                }
              }]
            });

            editor.onDidChangeCursorPosition((e) => {
              const model = editor.getModel();
              setCursorPosition({
                start: model.getOffsetAt(e.position),
                end: model.getOffsetAt(e.position)
              });
            });

            editor.getAction('editor.action.formatDocument').run();
          }}
        />
        
        <div 
          className={styles.textAreaVariableIconBox}
          onClick={() => setSelectedDropDownField(selectedDropDownField === "raw" ? null : "raw")}
        >
          <IoCodeSlash className={styles.textAreaVariableIcon} />
        </div>

        {selectedDropDownField === "raw" && (
          <VariableDropDownApiMenu
            isOpen={true}
            position={{ top: "0px", right: "70px" }}
            onSelect={handleRawVariableSelect}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.bodyComponentContainer}>
      <div className={styles.bodyComponentHeaderSection}>
        {["none", "multipart/form-data", "x-www-form-urlencoded", "raw"].map((type) => (
          <div key={type} className={styles.bodyTypeTitleBox}>
            <input
              type="radio"
              checked={bodyType === type}
              onChange={() => handleBodyTypeChange(type)}
              className={styles.radioInput}
            />
            <p onClick={() => handleBodyTypeChange(type)}>
              {type === "multipart/form-data" ? "Multipart/Form-Data" :
               type === "x-www-form-urlencoded" ? "x-www-form-urlencoded" :
               type.charAt(0).toUpperCase() + type.slice(1)}
            </p>
          </div>
        ))}
      </div>

      <div className={styles.bodyFieldsSection}>
        {bodyType === "none" && (
          <p className={styles.noBodyMessage}>
            No body data is required for this request type.
          </p>
        )}
        {(bodyType === "multipart/form-data" || bodyType === "x-www-form-urlencoded") && 
          renderFormFields()
        }
        {bodyType === "raw" && renderRawBody()}
      </div>
    </div>
  );
}
