import React, { useState, useEffect } from 'react';
import styles from '../apiCs/PostMenModel.module.css';
import { useSelector } from 'react-redux';
import { flowSelector } from '../../../redux/flow.reducer';
import UrlParamsComponent from './UrlParamsComponents';
import HeadersComponent from './HeadersComponent';
import BodyComponent from './BodyComponent';
import ResponseComponent from './ResponseComponent';
import AuthorizationComponent from './AuthorizationComponent';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const TABS = ['Params', 'Headers', 'Body', 'Auth', 'Response'];

export default function PostMenModel({ isOpen, onClose, onSave }) {
    const { currentSelectedNode } = useSelector(flowSelector);
    const [activeTab, setActiveTab] = useState('Params');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        reqUrl: '',
        methods: 'GET',
        urlParams: [],
        headers: [],
        authorization: {
            authType: 'none'
        },
        body: {
            type: 'none',
            bodyData: []
        },
        responseMapPathList: [],
        matchedPathVariableList: []
    });

    useEffect(() => {
        if (currentSelectedNode) {
            setFormData({
                name: currentSelectedNode.name || '',
                description: currentSelectedNode.description || '',
                reqUrl: currentSelectedNode.reqUrl || '',
                methods: currentSelectedNode.methods || 'GET',
                urlParams: currentSelectedNode.urlParams || [],
                headers: currentSelectedNode.headers || [],
                authorization: currentSelectedNode.authorization || { authType: 'none' },
                body: currentSelectedNode.body || { type: 'none', bodyData: [] },
                responseMapPathList: currentSelectedNode.responseMapPathList || [],
                matchedPathVariableList: currentSelectedNode.matchedPathVariableList || []
            });
        }
    }, [currentSelectedNode]);

    const handleMethodChange = (e) => {
        setFormData(prev => ({ ...prev, methods: e.target.value }));
    };

    const handleUrlChange = (e) => {
        setFormData(prev => ({ ...prev, reqUrl: e.target.value }));
    };

    const handleNameChange = (e) => {
        setFormData(prev => ({ ...prev, name: e.target.value }));
    };

    const handleDescriptionChange = (e) => {
        setFormData(prev => ({ ...prev, description: e.target.value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Params':
                return (
                    <UrlParamsComponent
                        urlParams={formData.urlParams}
                        onChange={(urlParams) => setFormData(prev => ({ ...prev, urlParams }))}
                    />
                );
            case 'Headers':
                return (
                    <HeadersComponent
                        headers={formData.headers}
                        onChange={(headers) => setFormData(prev => ({ ...prev, headers }))}
                    />
                );
            case 'Body':
                return (
                    <BodyComponent
                        body={formData.body}
                        onChange={(newBody) => setFormData(prev => ({ ...prev, body: newBody }))}
                    />
                );
            case 'Auth':
                return (
                    <AuthorizationComponent
                        authorization={formData.authorization}
                        onChange={(authorization) => setFormData(prev => ({ ...prev, authorization }))}
                    />
                );
            case 'Response':
                return (
                    <ResponseComponent
                        responseMapPathList={formData.responseMapPathList}
                        matchedPathVariableList={formData.matchedPathVariableList}
                        onChange={(response) => setFormData(prev => ({ 
                            ...prev, 
                            responseMapPathList: response.responseMapPathList,
                            matchedPathVariableList: response.matchedPathVariableList
                        }))}
                    />
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                
                <div className={styles.headerContainer}>
                    <div className={styles.requestTypeDropDownBox}>
                        <select 
                            className={styles.requestTypeDropdown}
                            value={formData.methods}
                            onChange={handleMethodChange}
                        >
                            {HTTP_METHODS.map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.requestUrlDiv}>
                        <input
                            type="text"
                            className={styles.requestUrlInput}
                            placeholder="Enter request URL"
                            value={formData.reqUrl}
                            onChange={handleUrlChange}
                        />
                    </div>

                    <button className={styles.testButton}> Test </button>
                </div>


                <div className={styles.requestSectionsContainer}>
                    {TABS.map(tab => (
                        <h3
                            key={tab}
                            className={`${styles.requestFields} ${activeTab === tab ? styles.selectedField : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </h3>
                    ))}
                </div>

                <div className={styles.selectedRequestFieldsWrapper}>
                    {renderTabContent()}
                </div>

                <div className={styles.requestModalFooterSection}>
                    <div className={styles.leftSideFooterBtnDiv}>
                        <button className={styles.cancelButton} onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                    <div className={styles.rightSideFooterBtnDiv}>
                        <button className={styles.testButton} onClick={handleSave}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
