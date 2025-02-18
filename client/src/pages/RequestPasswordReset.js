import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import API_BASE_URL from '../config';

const RequestPasswordReset = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response ? err.response.data.message : 'An error occurred');
        }
    };

    return (
        <Container>
            <Box mt={4}>
                <Typography variant="h4">Reset Password</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button type="submit" variant="contained" color="primary">Send Reset Link</Button>
                </form>
                {message && <Alert severity="success">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
            </Box>
        </Container>
    );
};

export default RequestPasswordReset;
