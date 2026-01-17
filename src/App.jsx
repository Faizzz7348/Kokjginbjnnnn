import React, { useState, useEffect } from 'react';
import RowEditingDemo from './RowEditingDemo';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';

// Import PrimeReact CSS
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function App() {
    const [theme, setTheme] = useState('dark');
    const menuRef = React.useRef(null);
    const [addRowCallback, setAddRowCallback] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [saveCallback, setSaveCallback] = useState(null);

    useEffect(() => {
        // Load initial theme immediately
        const link = document.createElement('link');
        link.id = 'theme-link';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/primereact/resources/themes/lara-dark-blue/theme.css';
        document.head.appendChild(link);
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

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const handleSaveAll = () => {
        if (saveCallback) {
            saveCallback();
        }
    };

    const menuItems = [
        {
            label: 'Add Row',
            icon: 'pi pi-plus',
            command: () => addRowCallback && addRowCallback(),
            disabled: !isEditMode
        },
        {
            label: isEditMode ? 'Exit Edit Mode' : 'Edit Mode',
            icon: isEditMode ? 'pi pi-times' : 'pi pi-pencil',
            command: toggleEditMode
        },
        {
            label: 'Save All',
            icon: 'pi pi-save',
            command: handleSaveAll,
            disabled: !isEditMode
        },
        { separator: true },
        {
            label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
            icon: theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon',
            command: toggleTheme
        }
    ];

    return (
        <>
            <nav className="nav-header">
                <div className="nav-content">
                    <h1 className="nav-title">DataTable Demo</h1>
                    <Button
                        onClick={(e) => menuRef.current.toggle(e)}
                        icon="pi pi-bars"
                        className="p-button-text"
                        aria-label="Menu"
                    />
                    <Menu
                        model={menuItems}
                        popup
                        ref={menuRef}
                    />
                </div>
            </nav>
            <div className="App" style={{ paddingTop: '7rem', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
            
            <RowEditingDemo 
                onAddRowRegister={setAddRowCallback} 
                isEditMode={isEditMode}
                onSaveRegister={setSaveCallback}
            />
            
            </div>
        </>
    );
}

export default App;
