import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../config';

const PasswordReset = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, newPassword });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response ? err.response.data.message : 'An error occurred');
        }
    };

    return (
        <Container>
            <Box mt={4}>
                <Typography variant="h4">Reset Your Password</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="New Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <TextField
                        label="Confirm Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" variant="contained" color="primary">Reset Password</Button>
                </form>
                {message && <Alert severity="success">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
            </Box>
        </Container>
    );
};

export default PasswordReset;
