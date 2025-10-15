// hubspot.js

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Typography
} from '@mui/material';
import axios from 'axios';

export const HubSpotIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [accountInfo, setAccountInfo] = useState(null);

    // Function to open OAuth in a new window
    const handleConnectClick = async () => {
        try {
            setIsConnecting(true);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/authorize`, formData);
            const authURL = response?.data;

            const newWindow = window.open(authURL, 'HubSpot Authorization', 'width=600, height=600');

            // Polling for the window to close
            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) {
                    window.clearInterval(pollTimer);
                    handleWindowClosed();
                }
            }, 200);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    }

    // Function to handle logic when the OAuth window closes
    const handleWindowClosed = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/credentials`, formData);
            const credentials = response.data;
            if (credentials) {
                setIsConnecting(false);
                setIsConnected(true);
                setIntegrationParams(prev => ({ ...prev, credentials: credentials, type: 'HubSpot' }));
                // Fetch account and user info
                const accountFormData = new FormData();
                accountFormData.append('credentials', JSON.stringify(credentials));
                const accountResponse = await axios.post(`http://localhost:8000/integrations/hubspot/account`, accountFormData);
                const userFormData = new FormData();
                userFormData.append('credentials', JSON.stringify(credentials));
                const userResponse = await axios.post(`http://localhost:8000/integrations/hubspot/user`, userFormData);
                setAccountInfo({ ...accountResponse.data, ...userResponse.data });
            }
            setIsConnecting(false);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    }

    // Function to disconnect HubSpot
    const handleDisconnect = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            await axios.post(`http://localhost:8000/integrations/hubspot/disconnect`, formData);
            setIsConnected(false);
            setIntegrationParams({});
            setAccountInfo(null);
            alert('HubSpot disconnected successfully');
        } catch (e) {
            alert(e?.response?.data?.detail || 'Failed to disconnect');
        }
    }

    useEffect(() => {
        setIsConnected(integrationParams?.credentials ? true : false)
    }, []);

    return (
        <>
        <Box display='flex' flexDirection='column' alignItems='center' sx={{mt: 2}}>
            <Box display='flex' alignItems='center'>
                <Button
                    variant='contained'
                    onClick={isConnected ? () => {} :handleConnectClick}
                    color={isConnected ? 'success' : 'primary'}
                    disabled={isConnecting}
                    style={{
                        pointerEvents: isConnected ? 'none' : 'auto',
                        cursor: isConnected ? 'default' : 'pointer',
                        opacity: isConnected ? 1 : undefined
                    }}
                >
                    {isConnected ? `HubSpot Connected - ${accountInfo?.user_email || '...'}` : isConnecting ? <CircularProgress size={20} /> : 'Connect to HubSpot'}
                </Button>
                {isConnected && (
                    <Button
                        variant='outlined'
                        color='error'
                        onClick={handleDisconnect}
                        sx={{ml: 2}}
                    >
                        Disconnect
                    </Button>
                )}
            </Box>

        </Box>
      </>
    );
}