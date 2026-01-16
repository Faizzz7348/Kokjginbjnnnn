import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Menu } from 'primereact/menu';
import { CustomerService } from './service/CustomerService';

export default function FlexibleScrollDemo() {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(['name', 'country', 'representative', 'company']);
    const [tempVisibleColumns, setTempVisibleColumns] = useState([]);
    const [isMaximized, setIsMaximized] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = React.useRef(null);

    const columns = [
        { field: 'name', header: 'Name' },
        { field: 'country.name', header: 'Country' },
        { field: 'representative.name', header: 'Representative' },
        { field: 'company', header: 'Company' }
    ];

    useEffect(() => {
        CustomerService.getCustomersMedium().then((data) => {
            setCustomers(data);
            setFilteredCustomers(data);
        });
    }, []);

    useEffect(() => {
        if (globalFilter === '') {
            setFilteredCustomers(customers);
        } else {
            const filtered = customers.filter((customer) => {
                return (
                    customer.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    customer.country.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    customer.representative.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    customer.company.toLowerCase().includes(globalFilter.toLowerCase())
                );
            });
            setFilteredCustomers(filtered);
        }
    }, [globalFilter, customers]);

    const toggleFullscreen = () => {
        setIsMaximized(!isMaximized);
    };

    const openCustomizeModal = () => {
        setTempVisibleColumns([...visibleColumns]);
        setCustomizeModalVisible(true);
    };

    const applyColumnCustomization = () => {
        setVisibleColumns(tempVisibleColumns);
        setCustomizeModalVisible(false);
    };

    const menuItems = [
        {
            label: 'Column Customize',
            icon: 'pi pi-table',
            command: openCustomizeModal
        },
        { separator: true },
        {
            label: isMaximized ? 'Exit Fullscreen' : 'Fullscreen',
            icon: isMaximized ? 'pi pi-window-minimize' : 'pi pi-window-maximize',
            command: toggleFullscreen,
            className: isMaximized ? 'menu-exit-fullscreen' : ''
        }
    ];

    const dialogFooterTemplate = () => {
        return <Button label="Ok" icon="pi pi-check" onClick={() => setDialogVisible(false)} />;
    };

    const dialogHeaderTemplate = () => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>Flex Scroll</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search..."
                            style={{ width: '250px' }}
                        />
                    </span>
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
                        onHide={() => setMenuOpen(false)}
                        style={{ width: '300px' }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="card">
            <Button label="Show" icon="pi pi-external-link" onClick={() => setDialogVisible(true)} />
            
            <Dialog 
                header={dialogHeaderTemplate()} 
                visible={dialogVisible} 
                style={isMaximized ? { width: '100vw', height: '100vh' } : { width: '75vw' }} 
                modal 
                closable={false}
                closeOnEscape={false}
                contentStyle={isMaximized ? { height: 'calc(100vh - 150px)' } : { height: '300px' }} 
                onHide={() => {
                    setDialogVisible(false);
                    setIsMaximized(false);
                }} 
                footer={dialogFooterTemplate}
            >
                <DataTable value={filteredCustomers} scrollable scrollHeight="flex" tableStyle={{ minWidth: '50rem' }}>
                    {visibleColumns.includes('name') && <Column field="name" header="Name" headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>}
                    {visibleColumns.includes('country.name') && <Column field="country.name" header="Country" headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>}
                    {visibleColumns.includes('representative.name') && <Column field="representative.name" header="Representative" headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>}
                    {visibleColumns.includes('company') && <Column field="company" header="Company" headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>}
                </DataTable>
            </Dialog>

            <Dialog
                header="Customize Columns"
                visible={customizeModalVisible}
                style={{ width: '450px' }}
                modal
                onHide={() => setCustomizeModalVisible(false)}
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" onClick={() => setCustomizeModalVisible(false)} className="p-button-text" />
                        <Button label="Apply" icon="pi pi-check" onClick={applyColumnCustomization} autoFocus />
                    </div>
                }
            >
                <div style={{ padding: '1rem 0' }}>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--text-color-secondary)' }}>
                        Select which columns to display in the table
                    </p>
                    <div className="column-customize-list">
                        {columns.map((col) => (
                            <div 
                                key={col.field} 
                                className="column-item"
                                onClick={() => {
                                    if (tempVisibleColumns.includes(col.field)) {
                                        setTempVisibleColumns(tempVisibleColumns.filter(f => f !== col.field));
                                    } else {
                                        setTempVisibleColumns([...tempVisibleColumns, col.field]);
                                    }
                                }}
                            >
                                <div className="column-item-content">
                                    <i className={`pi ${tempVisibleColumns.includes(col.field) ? 'pi-eye' : 'pi-eye-slash'}`} 
                                       style={{ fontSize: '1.25rem' }}></i>
                                    <span className="column-label">{col.header}</span>
                                </div>
                                <div className={`column-toggle ${tempVisibleColumns.includes(col.field) ? 'active' : ''}`}>
                                    <div className="column-toggle-thumb"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
