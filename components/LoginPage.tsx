import React, { useState } from 'react';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const applyErrorAnimation = () => {
            const form = document.getElementById('login-form-panel');
            form?.classList.add('animate-shake');
            setTimeout(() => form?.classList.remove('animate-shake'), 600);
        };

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('rago-admin-pass', password);
                onLoginSuccess();
            } else {
                setError(data.message || 'Ocurrió un error. Inténtalo de nuevo.');
                applyErrorAnimation();
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor. Verifica tu conexión.');
            applyErrorAnimation();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden animate-aurora selection:bg-rago-burgundy/80 selection:text-white">
            <div 
                id="login-form-panel"
                className="relative z-10 flex flex-col items-center w-full max-w-sm animate-fade-in-up"
            >
                {/* Logo */}
                <a href="/" className="mb-10 block transition-transform duration-300 hover:scale-105" aria-label="Volver a la página de inicio">
                    <img 
                        src="https://i.imgur.com/zOGb0ay.jpeg" 
                        alt="Rago Automotores Logo" 
                        className="h-28 drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]" 
                    />
                </a>

                {/* Form Container */}
                <div className="w-full bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 shadow-rago-glow border border-slate-700/80">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Panel de Control</h1>
                        <p className="mt-2 text-slate-300">Bienvenido. Ingrese su contraseña.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="sr-only">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-5 py-4 text-lg bg-slate-800/70 border-2 border-slate-700 rounded-lg placeholder-slate-500 text-white focus:bg-slate-800 focus:ring-2 focus:ring-rago-burgundy focus:border-transparent focus:outline-none transition-all duration-300 disabled:opacity-50"
                                placeholder="Contraseña"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-400 text-center animate-fade-in">{error}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full shimmer-effect group flex justify-center items-center py-4 px-4 text-lg font-bold rounded-lg text-white bg-rago-burgundy hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-60 disabled:hover:shadow-none disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Ingresando...</span>
                                    </>
                                ) : (
                                    <span>Ingresar</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                 <div className="mt-8">
                    <a 
                        href="/" 
                        className="text-slate-400 hover:text-white font-medium transition-colors duration-300 group inline-flex items-center gap-2"
                    >
                        <span className="transform transition-transform duration-300 group-hover:-translate-x-1">&larr;</span>
                        <span>Volver al sitio</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;