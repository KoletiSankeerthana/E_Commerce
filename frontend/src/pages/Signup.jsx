import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('https://ecommerce-vwsy.onrender.com/api/users/register', {
                name,
                email,
                password,
            });
            alert('Signup successful');
            navigate('/login');
        } catch (error) {
            alert(error.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="container section-padding" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '20px' }}>Sign Up</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '16px', marginTop: '10px' }}>
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Signup;
