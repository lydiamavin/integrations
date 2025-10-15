import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import axios from 'axios';

const endpointMapping = {
    'Notion': 'notion',
    'Airtable': 'airtable',
    'HubSpot': 'hubspot',
};

export const DataForm = ({ integrationType, credentials }) => {
    const [loadedData, setLoadedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const endpoint = endpointMapping[integrationType];

    const handleLoad = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('credentials', JSON.stringify(credentials));
            const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);
            const data = response.data;
            setLoadedData(data);
        } catch (e) {
            alert(e?.response?.data?.detail);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' width='100%'>
            <Box display='flex' flexDirection='column' width='100%'>
                {loadedData ? (
                    <Box sx={{mt: 2}}>
                        <Typography variant="h6">Loaded Data ({loadedData.length} items):</Typography>
                        <List>
                            {loadedData.map((item, index) => (
                                <ListItem key={index} sx={{border: '1px solid #ddd', mb: 1, borderRadius: 1}}>
                                    <ListItemText
                                        primary={`Name: ${item.name}`}
                                        secondary={`Type: ${item.type} | ID: ${item.id} | Created: ${item.creation_time ? new Date(item.creation_time).toLocaleString() : 'N/A'} | Modified: ${item.last_modified_time ? new Date(item.last_modified_time).toLocaleString() : 'N/A'}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                ) : (
                    <Typography sx={{mt: 2}}>No data loaded yet.</Typography>
                )}
                <Button
                    onClick={handleLoad}
                    sx={{mt: 2}}
                    variant='contained'
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={20} /> : 'Load Data'}
                </Button>
                <Button
                    onClick={() => setLoadedData(null)}
                    sx={{mt: 1}}
                    variant='contained'
                >
                    Clear Data
                </Button>
            </Box>
        </Box>
    );
}
