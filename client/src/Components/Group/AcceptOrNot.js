import React, { useEffect, useState } from 'react';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography, Box, Button, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { shareDecisionInInnerCircle, getSharedMembers } from './Network_Call';
import { ToastContainer, toast } from 'react-toastify';

const AcceptOrNot = ({ innerCircleDetails, decision, id }) => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [sharedMembers, setSharedMembers] = useState([]);
    const navigate = useNavigate();

    const handleMemberClick = (memberId) => {
        setSelectedMember(prevSelectedMember => prevSelectedMember === memberId ? null : memberId);
    };

    const handleSubmit = async () => {
        const payload = {
            decisionId: id,
            groupId: innerCircleDetails.group.id,
            memberId: selectedMember
        };

        try {
            const response = await shareDecisionInInnerCircle(payload);
            if (response.status === 200) {
                toast('Decision shared successfully!');
                setSelectedMember(null); // Deselect after successful submission
            } else {
                toast('Failed to share decision.');
            }
        } catch (error) {
            console.error('Error sharing decision:', error);
            toast('An error occurred while sharing the decision.');
        }
    };

    const getSharedMembersList = async () => {
        const payload = {
            groupId: innerCircleDetails.group.id,
            decisionId: id
        };

        try {
            const response = await getSharedMembers(payload);
            console.log("response from shared member list", response);
            setSharedMembers(response);
        } catch (error) {
            console.error('Error in fetching the shared members:', error);
            toast('An error occurred while fetching the shared member decision');
        }
    };

    useEffect(() => {
        getSharedMembersList();
    }, [innerCircleDetails.group.id]); 

    return (
        <div>
            <Typography variant="h5">Inner Circle Details</Typography>
            {innerCircleDetails && innerCircleDetails.members ? (
                <List>
                    {innerCircleDetails.members.map(member => {
                        const sharedMember = sharedMembers.find(shared => shared.groupMember === member.user_id);
                        const isClickable = !sharedMember;

                        return (
                            <ListItem 
                                key={member.user_id} 
                                button={isClickable}
                                onClick={() => isClickable && handleMemberClick(member.user_id)} 
                                selected={selectedMember === member.user_id}
                                style={{cursor: isClickable ? "pointer" : "default"}}
                            >
                                <ListItemAvatar>
                                    <Avatar style={{ backgroundColor: "#526D82", color: "white" }}>{member.displayname.charAt(0)}</Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={member.displayname} 
                                    secondary={member.email} 
                                />
                                {selectedMember === member.user_id && (
                                    <CheckIcon color="primary" />
                                )}
                                {sharedMember && (
                                    <>
                                        {sharedMember.status === "Not Accepted" && (
                                            <Typography variant="caption" color="error">Not Accepted</Typography>
                                        )}
                                        {sharedMember.status === "Accepted" && (
                                            <Typography variant="caption" color="primary">Accepted</Typography>
                                        )}
                                    </>
                                )}
                            </ListItem>
                        );
                    })}
                </List>
            ) : (
                <Typography>No members in this inner circle</Typography>
            )}
            <Typography variant="h5">Decision Details</Typography>
            <Typography><strong>Name:</strong> {decision.decision_name}</Typography>
            <Typography><strong>Details:</strong> {decision.user_statement}</Typography>
            <Typography><strong>Reasons:</strong> {decision.decision_reason_text && decision.decision_reason_text.join(', ')}</Typography>
            <Typography><strong>Due Date:</strong> {decision.decision_due_date}</Typography>
            <Typography><strong>Taken Date:</strong> {decision.decision_taken_date}</Typography>
            {selectedMember && (
                <Box mt={2}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Share Decision
                    </Button>
                </Box>
            )}
            <ToastContainer />
        </div>
    );
};

export default AcceptOrNot;