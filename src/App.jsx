import React, { useState, useEffect } from 'react';
import RowEditingDemo from './RowEditingDemo';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';

// Import PrimeReact CSS
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function App() {
    const [theme, setTheme] = useState('dark');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = React.useRef(null);
    const [addRowCallback, setAddRowCallback] = useState(null);

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

    // Toggle body class for backdrop blur
    useEffect(() => {
        if (menuOpen) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
        return () => document.body.classList.remove('menu-open');
    }, [menuOpen]);

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen) {
                const menuElement = menuRef.current?.getElement();
                const hamburgerBtn = document.querySelector('.nav-header .hamburger-btn');
                
                if (menuElement && !menuElement.contains(event.target) && 
                    hamburgerBtn && !hamburgerBtn.contains(event.target)) {
                    menuRef.current?.hide();
                }
            }
        };

        if (menuOpen) {
            // Add delay to avoid immediate trigger
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 100);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [menuOpen]);

    const menuItems = [
        {
            label: 'Add Row',
            icon: 'pi pi-plus',
            command: () => addRowCallback && addRowCallback()
        },
        { separator: true },
        {
            label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
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
                        onClick={(e) => {
                            setMenuOpen(!menuOpen);
                            menuRef.current.toggle(e);
                        }}
                        className="hamburger-btn p-button-text"
                        aria-label="Menu"
                    >
                        <div className={`hamburger-icon ${menuOpen ? 'active' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </Button>
                    <Menu
                        model={menuItems}
                        popup
                        ref={menuRef}
                        onShow={() => setMenuOpen(true)}
                        onHide={() => setMenuOpen(false)}
                        className="flex-table-menu"
                        style={{ width: '350px' }}
                        appendTo={document.body}
                    />
                </div>
            </nav>
            <div className="App" style={{ paddingTop: '7rem', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
            
            <RowEditingDemo onAddRowRegister={setAddRowCallback} />
            
            </div>
        </>
    );
}

export default App;
