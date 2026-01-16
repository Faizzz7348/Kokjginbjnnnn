import React, { useState, useEffect } from 'react';
import FlexibleScrollDemo from './FlexibleScrollDemo';
import RowEditingDemo from './RowEditingDemo';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

// Import PrimeReact CSS
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function App() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Load initial theme
        loadTheme(theme);
    }, []);

    const loadTheme = (themeName) => {
        // Remove old theme link
        const existingThemeLink = document.getElementById('theme-link');
        if (existingThemeLink) {
            existingThemeLink.remove();
        }

        // Add new theme link
        const link = document.createElement('link');
        link.id = 'theme-link';
        link.rel = 'stylesheet';
        link.href = themeName === 'dark' 
            ? 'https://unpkg.com/primereact/resources/themes/lara-dark-blue/theme.css'
            : 'https://unpkg.com/primereact/resources/themes/lara-light-blue/theme.css';
        document.head.appendChild(link);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        loadTheme(newTheme);
    };

    return (
        <div className="App" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Button 
                    label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                    icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'}
                    onClick={toggleTheme}
                    severity="secondary"
                />
            </div>

            <Divider />
            
            <h2>Row Editing Table</h2>
            <RowEditingDemo />
            
            <Divider />
            
            <h2>Flexible Scroll Dialog</h2>
            <FlexibleScrollDemo />
        </div>
    );
}

export default App;
