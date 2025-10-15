import { IntegrationForm } from './integration-form';
import { Container, Typography, Box } from '@mui/material';

function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          Integrations Platform
        </Typography>
        <IntegrationForm />
      </Box>
    </Container>
  );
}

export default App;
