import React, { useState, useEffect } from 'react';
import RowEditingDemo from './RowEditingDemo';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

function App() {
    const [theme, setTheme] = useState('dark');
    const menuRef = React.useRef(null);
    const menuButtonRef = React.useRef(null);
    const [addRowCallback, setAddRowCallback] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isTogglingEditMode, setIsTogglingEditMode] = useState(false);
    const [saveCallback, setSaveCallback] = useState(null);
    const [hasChangesCallback, setHasChangesCallback] = useState(null);
    const [discardChangesCallback, setDiscardChangesCallback] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Theme already loaded in HTML head, no need to load again
        // Just set the theme state
        setTheme('dark');
    }, []);

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if menu is visible
            const menuElement = menuRef.current?.getElement();
            const menuButton = menuButtonRef.current;
            
            if (menuElement && menuButton) {
                // Check if click is outside both menu and button
                if (!menuElement.contains(event.target) && !menuButton.contains(event.target)) {
                    menuRef.current?.hide();
                    setIsMenuOpen(false);
                }
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);
        
        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadTheme = (themeName) => {
        const themeLink = document.getElementById('theme-link');
        if (themeLink) {
            // Add loading class to prevent flash
            document.body.style.opacity = '0.95';
            
            // Change theme instantly (already preloaded)
            themeLink.href = themeName === 'dark' 
                ? 'https://unpkg.com/primereact/resources/themes/lara-dark-blue/theme.css'
                : 'https://unpkg.com/primereact/resources/themes/lara-light-blue/theme.css';
            
            // Wait for CSS to apply then restore opacity
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        loadTheme(newTheme);
    };

    const toggleEditMode = () => {
        // If exiting edit mode, check for unsaved changes
        if (isEditMode && hasChangesCallback && hasChangesCallback()) {
            confirmDialog({
                message: 'You have unsaved changes. What would you like to do before exiting Edit Mode?',
                header: 'Unsaved Changes',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Save & Exit',
                rejectLabel: 'Discard & Exit',
                acceptClassName: 'p-button-success',
                rejectClassName: 'p-button-danger',
                accept: () => {
                    // Save all changes then exit with loading state
                    setIsTogglingEditMode(true);
                    setTimeout(() => {
                        if (saveCallback) {
                            saveCallback();
                        }
                        setIsEditMode(false);
                        setTimeout(() => {
                            setIsTogglingEditMode(false);
                        }, 300);
                    }, 100);
                },
                reject: () => {
                    // Discard changes and exit with loading state
                    setIsTogglingEditMode(true);
                    setTimeout(() => {
                        if (discardChangesCallback) {
                            discardChangesCallback();
                        }
                        setIsEditMode(false);
                        setTimeout(() => {
                            setIsTogglingEditMode(false);
                        }, 300);
                    }, 100);
                }
            });
        } else {
            // No changes or entering edit mode, toggle with loading state
            setIsTogglingEditMode(true);
            setTimeout(() => {
                setIsEditMode(!isEditMode);
                setTimeout(() => {
                    setIsTogglingEditMode(false);
                }, 300);
            }, 100);
        }
    };

    const handleSaveAll = () => {
        if (saveCallback) {
            saveCallback();
        }
    };

    return (
        <>
            <ConfirmDialog />
            
            {/* Loading Overlay for Edit Mode Toggle */}
            {isTogglingEditMode && (
                <div className="edit-mode-loading-overlay">
                    <div className="edit-mode-loading-content">
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: '#fff' }}></i>
                        <span style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#fff' }}>
                            {isEditMode ? 'Exiting Edit Mode...' : 'Entering Edit Mode...'}
                        </span>
                    </div>
                </div>
            )}

            {isMenuOpen && (
                <div 
                    className="menu-backdrop"
                    onClick={() => {
                        menuRef.current.hide();
                        setIsMenuOpen(false);
                    }}
                />
            )}
            <nav className="nav-header">
                <div className="nav-content">
                    <div className="nav-title-wrapper">
                        <h1 className="nav-title">
                            {isEditMode ? 'Edit Mode' : 'Vending Machines Route'}
                        </h1>
                        <div className="nav-subtitle">
                            {isEditMode ? 'Make changes and save' : 'PrimeReact | Table Management'}
                        </div>
                    </div>
                    <button
                        ref={menuButtonRef}
                        onClick={(e) => {
                            menuRef.current.toggle(e);
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="hamburger-button nav-menu-button"
                        aria-label="Menu"
                    >
                        <div className={`hamburger-icon ${isMenuOpen ? 'open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                    <OverlayPanel 
                        ref={menuRef} 
                        appendTo={document.body} 
                        style={{ width: '250px' }}
                        onHide={() => setIsMenuOpen(false)}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Button
                                label="Add Row"
                                icon="pi pi-plus"
                                className="p-button-text p-button-plain"
                                onClick={() => {
                                    if (addRowCallback) addRowCallback();
                                    menuRef.current.hide();
                                    setIsMenuOpen(false);
                                }}
                                disabled={!isEditMode}
                                style={{ justifyContent: 'flex-start' }}
                            />
                            <div style={{ borderTop: '1px solid var(--surface-border)', margin: '4px 0' }} />
                            <Button
                                label={isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
                                icon={isTogglingEditMode ? 'pi pi-spin pi-spinner' : (isEditMode ? 'pi pi-times' : 'pi pi-pencil')}
                                className="p-button-text p-button-plain"
                                onClick={() => {
                                    toggleEditMode();
                                    menuRef.current.hide();
                                    setIsMenuOpen(false);
                                }}
                                disabled={isTogglingEditMode}
                                style={{ 
                                    justifyContent: 'flex-start',
                                    color: isEditMode ? '#ef4444' : undefined,
                                    opacity: isTogglingEditMode ? 0.6 : 1
                                }}
                            />
                            <Button
                                label="Save All"
                                icon="pi pi-save"
                                className="p-button-text p-button-plain"
                                onClick={() => {
                                    handleSaveAll();
                                    menuRef.current.hide();
                                    setIsMenuOpen(false);
                                }}
                                disabled={!isEditMode}
                                style={{ 
                                    justifyContent: 'flex-start',
                                    color: '#22c55e'
                                }}
                            />
                            <div style={{ borderTop: '1px solid var(--surface-border)', margin: '4px 0' }} />
                            <Button
                                label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'}
                                className="p-button-text p-button-plain"
                                onClick={() => {
                                    toggleTheme();
                                    menuRef.current.hide();
                                    setIsMenuOpen(false);
                                }}
                                style={{ justifyContent: 'flex-start' }}
                            />
                        </div>
                    </OverlayPanel>
                </div>
            </nav>
            <div className="App" style={{ paddingTop: '7rem', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
            
            <RowEditingDemo 
                onAddRowRegister={setAddRowCallback} 
                isEditMode={isEditMode}
                onSaveRegister={setSaveCallback}
                onHasChangesRegister={setHasChangesCallback}
                onDiscardChangesRegister={setDiscardChangesCallback}
            />
            
            </div>
        </>
    );
}

export default App;
