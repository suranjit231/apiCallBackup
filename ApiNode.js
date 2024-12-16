import React from "react";
import { IoMenu } from "react-icons/io5";
import styles from "../apiCs/ApiNode.module.css";
import { FaExternalLinkAlt } from "react-icons/fa";
import { flowSelector } from "../../../redux/flow.reducer";
import { addResponseStatusApi,
     updateResponseStatusApi,
     deleteResponseStatusApi, setDefaultNext } from "../../../redux/api.reducer";

     import { useSelector, useDispatch } from "react-redux";
import StatusCodeRouteModel from "./StatusCodeRoute";
import { useState } from "react";
import NextStepModel from "../../../utility/nextStepsModel/NextStepModel";
import PostMenModel from "./PostMenModel";

export default function ApiNode() {
    const { currentFlow } = useSelector(flowSelector);
    const { currentSelectedNode } = currentFlow;
    const [showStatusCodeModal, setShowStatusCodeModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const dispatch = useDispatch();
    const [isNextStepsModelOpen, setIsNextStepsModelOpen] = useState(false);

    const [ isOpenPostMenModel, setIsOpenPostMenModel] = useState(false);

    const handleAddRoute = () => {
        setIsEditMode(false);
        setSelectedStatus(null);
        setShowStatusCodeModal(true);
    };


    // ============= handle save status code ===========//
    const handleStatusCodeSave = async (statusCode, selectedGotoNode) => {
        try {
            if (isEditMode && selectedStatus) {
                // Update existing status
                console.log("Updating status with:", {
                    flowId: currentFlow._id,
                    nodeId: currentSelectedNode._id,
                    statusId: selectedStatus._id, // Use MongoDB _id
                    updates: {
                        status: parseInt(statusCode),
                        next: selectedGotoNode.id
                    }
                });

                // ===== if edit mode then update status ==============//
                await dispatch(updateResponseStatusApi({
                    flowId: currentFlow._id,
                    nodeId: currentSelectedNode._id,
                    statusId: selectedStatus._id, // Use MongoDB _id
                    updates: {
                        status: parseInt(statusCode),
                        next: selectedGotoNode.id
                    }
                })).unwrap();
            } else {
                // Add new status
                console.log("Adding new status with:", {
                    flowId: currentFlow._id,
                    nodeId: currentSelectedNode._id,
                    updates: {
                        status: parseInt(statusCode),
                        next: selectedGotoNode.id
                    }
                });

                // ===== if add mode then add new status ==============//
                await dispatch(addResponseStatusApi({
                    flowId: currentFlow._id,
                    nodeId: currentSelectedNode._id,
                    updates: {
                        status: parseInt(statusCode),
                        next: selectedGotoNode.id
                    }
                })).unwrap();
            }
            setShowStatusCodeModal(false);
        } catch (error) {
            console.error("Error saving status:", error);
        }
    };

    // ========== when click in staus code make it edit mode ===========//
    const handleStatusCodeClick = (status) => {
        setIsEditMode(true);
        setSelectedStatus(status);
        setShowStatusCodeModal(true);
    };


    // ========== function to delete status ===========//

    const handleDeleteStatus = async (status) => {
        try {
            await dispatch(deleteResponseStatusApi({
                flowId: currentFlow._id,
                nodeId: currentSelectedNode._id,
                statusObject: status
            })).unwrap();
            setShowStatusCodeModal(false);
        } catch (error) {
            console.error("Error deleting status:", error);
        }
    };

    // ========== function to close modal for status code===========//
    const handleCloseModal = () => {
        setShowStatusCodeModal(false);
        setSelectedStatus(null);
        setIsEditMode(false);
    };


    // ========== function to open next steps model ===========//
    const handleOpenNextStepsModal = () => {
        setIsNextStepsModelOpen(true);
    };


    // ========== function to close next steps model ===========//
    const handleCloseNextStepsModal = () => {
        setIsNextStepsModelOpen(false);
    };

    // ========== function to get next steps value ===========//
    const getNextStepValue = (result) => {
        console.log("value getting from next model: ", result);
        const { nodeId, isNew, nodeType } = result;
        dispatch(setDefaultNext({
            flowId: currentFlow._id,
            nodeId: currentSelectedNode._id,
            nextNodeId: nodeId
        }))
    };

    // ====== function show label in next node =====//
    function showLabelInNextNode(noteId) {
        const node = currentFlow.nodes.find((node) => node._id === noteId);
        return node?.label;
    }


    // ========= function to open postmen model ===========//
    function handleOpenPostMenModel(){
        setIsOpenPostMenModel(true);
    };

    //======== function to close postmen model ===========//
    function handleClosePostMenModel(){
        setIsOpenPostMenModel(false);
    };


    // ====== handle save postmen model ===========//
    function handlePostmenModelSaveButtonClicked(data){
        console.log("data from postmen model: ", data);
        setIsOpenPostMenModel(false);
    };

    return (
        <>
            <div className={styles.ApiCallMainContainer}>
                <div className={styles.apiCallNodeTitleDiv}>
                    <div className={styles.titleIcon}>&#9735;</div>
                    <input
                        type="text"
                        placeholder="Custom tag..."
                        value={currentSelectedNode?.label}
                        onChange={(e) => {}}
                        className={styles.labelInput}
                    />
                    <div className={styles.toggleMenuIcon}>
                        <IoMenu />
                    </div>
                </div>

                <div className={styles.apiResponseWithMappedVariableDisplayBox}>
                    <p>Response taken from API and mapped to variables as shown below:</p>
                    {currentSelectedNode?.responseMapPathList && currentSelectedNode?.responseMapPathList?.map((mapPath, idx) => (
                        <div key={idx}>
                            <p>Path: {mapPath.jsonPath} → Variable: {mapPath.value} {mapPath.fallback && `(Fallback: ${mapPath.fallback})`}</p>
                        </div>
                    ))}
                </div>

                <div className={styles.apiReqResponseBox}>
                    <div className={styles.boxTitle}>
                        <FaExternalLinkAlt className={styles.linkIcon} />
                        <p>External Request</p>
                    </div>

                    <div onClick={() => handleOpenPostMenModel()} className={styles.apiRequestUrl}>
                        <p>show req url</p>
                    </div>

                    <div className={styles.responseStatusCodeButtonDiv}>
                        {currentSelectedNode?.responseStatus && currentSelectedNode?.responseStatus?.length > 0 && currentSelectedNode?.responseStatus?.map((status, idx) => (
                            <div key={idx} className={styles.statusCodeContainer}>
                                <p 
                                    className={styles.responseStatusCode} 
                                    onClick={() => handleStatusCodeClick(status)}
                                >
                                    {status.status}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div onClick={handleAddRoute} className={styles.addResponseRoutesButton}>
                        + Add Route
                    </div>
                </div>

                {/* ========== next steps button after performing this api call===== */}
                <div className={styles.nextStepsButtonAfterApiCall}>
                    <p>Next step after actions are performed</p>

                    <div onClick={()=>handleOpenNextStepsModal()} className={styles.nextStepsButton}>
                        {showLabelInNextNode(currentSelectedNode?.defaultNext) || 'Select Next Step'}
                    </div>
                </div>
            </div>



            {/* ========== status code modal========= */}
            {showStatusCodeModal && (
                <StatusCodeRouteModel
                    isOpen={showStatusCodeModal}
                    onClose={handleCloseModal}
                    currentNode={currentSelectedNode}
                    isEditMode={isEditMode}
                    statusData={selectedStatus}
                    onSave={handleStatusCodeSave}
                    onDelete={handleDeleteStatus}
                />
            )}


            {/* ========== next steps modal========= */}
            {isNextStepsModelOpen && (
                <NextStepModel
                    onSelect={getNextStepValue}
                    onClose={handleCloseNextStepsModal}
                    position={currentSelectedNode?.position || { x: 0, y: 0 }}
                />
            )}


            {/* ========== postmen modal========= */}

            {isOpenPostMenModel && (
                <PostMenModel
                    isOpen={isOpenPostMenModel}
                    onClose={handleClosePostMenModel}
                    onSave={handlePostmenModelSaveButtonClicked}
                />
            )}

        </>
    );
}
