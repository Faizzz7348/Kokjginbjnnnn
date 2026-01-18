import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Menu } from 'primereact/menu';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ProductService } from './service/ProductService';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function RowEditingDemo({ onAddRowRegister, isEditMode, onSaveRegister, onHasChangesRegister, onDiscardChangesRegister }) {
    const [products, setProducts] = useState(null);
    const [savedProducts, setSavedProducts] = useState(null);
    const [preSavedRows, setPreSavedRows] = useState({});
    const [modalPreSavedRows, setModalPreSavedRows] = useState({}); // Format: { mainRowId: { modalRowId: true } }
    const [rowModalData, setRowModalData] = useState({});
    const [rowChangesCounts, setRowChangesCounts] = useState({});
    const [currentModalChanges, setCurrentModalChanges] = useState(0);
    const [dataVersion, setDataVersion] = useState(0);
    const [statuses] = useState(['AM', 'PM']);
    const [showFlexTableModal, setShowFlexTableModal] = useState(false);
    const [editingRows, setEditingRows] = useState({});
    const [modalEditingRows, setModalEditingRows] = useState({});
    
    // Flex Table Modal States
    const [modalProducts, setModalProducts] = useState([]);
    const [filteredModalProducts, setFilteredModalProducts] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(['code', 'location', 'inventoryStatus']);
    const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
    const [tempVisibleColumns, setTempVisibleColumns] = useState([]);
    const [isModalMaximized, setIsModalMaximized] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedInfoRow, setSelectedInfoRow] = useState(null);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [selectedLocationInfo, setSelectedLocationInfo] = useState(null);
    const [isFlexMenuOpen, setIsFlexMenuOpen] = useState(false);
    const menuRef = React.useRef(null);

    const allColumns = [
        { field: 'code', header: 'Code' },
        { field: 'location', header: 'Location' },
        { field: 'inventoryStatus', header: 'Delivery' }
    ];

    useEffect(() => {
        ProductService.getProductsMini().then((data) => setProducts(data));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (onAddRowRegister) {
            onAddRowRegister(() => addRow);
        }
    }, [onAddRowRegister, products]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (onSaveRegister) {
            onSaveRegister(() => saveAll);
        }
    }, [onSaveRegister, products]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (onHasChangesRegister) {
            onHasChangesRegister(() => () => {
                // Check if there are any unsaved changes
                const hasPreSavedRows = Object.keys(preSavedRows).length > 0;
                const hasModalChanges = Object.keys(modalPreSavedRows).some(mainRowId => 
                    Object.keys(modalPreSavedRows[mainRowId]).length > 0
                );
                return hasPreSavedRows || hasModalChanges;
            });
        }
    }, [onHasChangesRegister, preSavedRows, modalPreSavedRows]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (onDiscardChangesRegister) {
            onDiscardChangesRegister(() => discardChanges);
        }
    }, [onDiscardChangesRegister]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (globalFilter === '') {
            setFilteredModalProducts(modalProducts);
        } else {
            const filtered = modalProducts.filter((product) => {
                return (
                    product.code?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    product.location?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    product.inventoryStatus?.toLowerCase().includes(globalFilter.toLowerCase())
                );
            });
            setFilteredModalProducts(filtered);
        }
    }, [globalFilter, modalProducts]);

    // Function to detect duplicate codes in modal products (including other flex tables)
    const getDuplicateCodes = () => {
        const codeCounts = {};
        const duplicates = new Set();
        
        // Check codes in current modal
        modalProducts.forEach(product => {
            const code = product.code?.trim().toLowerCase();
            if (code) {
                codeCounts[code] = (codeCounts[code] || 0) + 1;
            }
        });
        
        // Also check codes in other saved modal data from other rows
        Object.keys(rowModalData).forEach(mainRowId => {
            // Skip if it's the current selected row (already counted above)
            if (selectedRow && mainRowId === selectedRow.id.toString()) {
                return;
            }
            
            const otherModalProducts = rowModalData[mainRowId] || [];
            otherModalProducts.forEach(product => {
                const code = product.code?.trim().toLowerCase();
                if (code) {
                    codeCounts[code] = (codeCounts[code] || 0) + 1;
                }
            });
        });
        
        // Mark codes that appear more than once as duplicates
        Object.keys(codeCounts).forEach(code => {
            if (codeCounts[code] > 1) {
                duplicates.add(code);
            }
        });
        
        return duplicates;
    };

    // Function to check if a row has duplicate code
    const hasDuplicateCode = (rowData) => {
        const duplicates = getDuplicateCodes();
        const code = rowData.code?.trim().toLowerCase();
        return duplicates.has(code);
    };



    const getSeverity = (value) => {
        switch (value) {
            case 'Daily':
                return 'success';
            case 'Weekday':
                return 'info';
            case 'Alt 1':
                return 'warning';
            case 'Alt 2':
                return 'danger';
            case 'AM':
                return 'success';
            case 'PM':
                return 'warning';
            case 'NIGHT':
                return 'info';
            default:
                return null;
        }
    };

    const onRowEditComplete = (e) => {
        let _products = [...products];
        let { newData, index } = e;

        _products[index] = newData;
        setProducts(_products);
        
        // Mark row as pre-saved (modified but not finally saved)
        setPreSavedRows(prev => ({
            ...prev,
            [newData.id]: true
        }));
    };

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };

    const shiftEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={statuses}
                onChange={(e) => options.editorCallback(e.value)}
                placeholder="Select Shift"
                appendTo={document.body}
                itemTemplate={(option) => {
                    return <Tag value={option} severity={getSeverity(option)}></Tag>;
                }}
            />
        );
    };

    const deliveryEditor = (options) => {
        const deliveryStatuses = ['Daily', 'Weekday', 'Alt 1', 'Alt 2'];
        return (
            <Dropdown
                value={options.value}
                options={deliveryStatuses}
                onChange={(e) => options.editorCallback(e.value)}
                placeholder="Select Delivery"
                appendTo={document.body}
                panelStyle={{ zIndex: 9999 }}
            />
        );
    };

    const priceEditor = (options) => {
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} mode="currency" currency="USD" locale="en-US" />;
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.inventoryStatus} severity={getSeverity(rowData.inventoryStatus)}></Tag>;
    };

    const priceBodyTemplate = (rowData) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rowData.price);
    };

    const allowEdit = (rowData) => {
        return rowData.name !== 'Blue Band';
    };

    const saveAll = () => {
        // Save current products state
        setSavedProducts([...products]);
        // Clear all editing rows
        setEditingRows({});
        setModalEditingRows({});
        // Clear pre-saved markers
        setPreSavedRows({});
        setModalPreSavedRows({});
        // Clear badge counts
        setRowChangesCounts({});
        // Save modal data permanently
        console.log('Saving all data:', {
            mainTable: products,
            modalData: rowModalData
        });
        // You can add API call here to save to backend
        alert('All changes saved successfully!');
    };

    const discardChanges = () => {
        // Reload products from saved state or refetch from service
        if (savedProducts) {
            setProducts([...savedProducts]);
        } else {
            // If no saved state, reload from service
            ProductService.getProductsMini().then((data) => setProducts(data));
        }
        // Clear all editing states
        setEditingRows({});
        setModalEditingRows({});
        // Clear pre-saved markers
        setPreSavedRows({});
        setModalPreSavedRows({});
        // Clear badge counts
        setRowChangesCounts({});
        // Clear modal data
        setRowModalData({});
    };

    const addRow = () => {
        const newRow = {
            id: Math.max(...(products || []).map(p => p.id || 0)) + 1,
            code: '',
            name: '',
            inventoryStatus: 'AM',
            category: 'New',
            quantity: 0,
            price: 0
        };
        setProducts([...(products || []), newRow]);
    };

    const confirmDelete = (rowData) => {
        confirmDialog({
            message: 'Are you sure you want to delete this row?',
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => {
                const _products = products.filter(p => p.id !== rowData.id);
                setProducts(_products);
            }
        });
    };

    const confirmModalDelete = (rowData) => {
        confirmDialog({
            message: 'Are you sure you want to delete this row?',
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => {
                const _products = modalProducts.filter(p => p.id !== rowData.id);
                setModalProducts(_products);
                setFilteredModalProducts(_products);
            }
        });
    };

    const onOpenFlexTableModal = (rowData) => {
        // Store selected row data
        setSelectedRow(rowData);
        // Reset current modal changes counter
        setCurrentModalChanges(0);
        
        // Check if this row already has modal data saved
        if (rowModalData[rowData.id]) {
            // Load existing modal data for this row
            setModalProducts(rowModalData[rowData.id]);
            setFilteredModalProducts(rowModalData[rowData.id]);
        } else {
            // Load products for modal and filter based on selected row
            ProductService.getProductsMini().then((data) => {
                // Filter data based on the selected row's code
                const filteredData = data.filter((product) => {
                    if (rowData.code && product.category) {
                        return product.category.toLowerCase().includes(rowData.code.charAt(0).toLowerCase());
                    }
                    return true;
                });
                
                setModalProducts(filteredData);
                setFilteredModalProducts(filteredData);
            });
        }
        setShowFlexTableModal(true);
    };

    const onModalRowEditComplete = (e) => {
        let _products = [...modalProducts];
        let { newData, index, originalEvent } = e;
        
        // Create temporary array with updated data
        const tempProducts = [...modalProducts];
        tempProducts[index] = newData;
        
        // Get all existing codes from all flex tables
        const allExistingCodes = [];
        
        // Add codes from current modal (except the one being edited)
        tempProducts.forEach((p, i) => {
            if (i !== index) {
                const code = p.code?.trim().toLowerCase();
                if (code) allExistingCodes.push(code);
            }
        });
        
        // Add codes from other saved modal data (other main rows)
        Object.keys(rowModalData).forEach(mainRowId => {
            // Skip if it's the current selected row
            if (selectedRow && mainRowId === selectedRow.id.toString()) {
                return;
            }
            
            const otherModalProducts = rowModalData[mainRowId] || [];
            otherModalProducts.forEach(product => {
                const code = product.code?.trim().toLowerCase();
                if (code) allExistingCodes.push(code);
            });
        });
        
        // Check if the new code is a duplicate
        const newCode = newData.code?.trim().toLowerCase();
        if (newCode && allExistingCodes.includes(newCode)) {
            // Prevent save by rejecting the edit
            originalEvent.preventDefault();
            alert(`⚠️ Duplicate Code Detected!\n\nThe code "${newData.code}" already exists in another flex table.\nPlease use a unique code across all tables.`);
            return;
        }
        
        _products[index] = newData;
        setModalProducts(_products);
        
        // Mark modal row as pre-saved for this specific main row
        if (selectedRow) {
            setModalPreSavedRows(prev => ({
                ...prev,
                [selectedRow.id]: {
                    ...(prev[selectedRow.id] || {}),
                    [newData.id]: true
                }
            }));
        }
        
        // Increment temporary counter for current modal session
        setCurrentModalChanges(prev => prev + 1);
    };

    const openCustomizeModal = () => {
        setTempVisibleColumns([...visibleColumns]);
        setCustomizeModalVisible(true);
    };

    const applyColumnCustomization = () => {
        setVisibleColumns(tempVisibleColumns);
        setCustomizeModalVisible(false);
    };

    const cancelColumnCustomization = () => {
        setCustomizeModalVisible(false);
    };

    const toggleModalMaximize = () => {
        setIsModalMaximized(!isModalMaximized);
    };

    const addModalRow = () => {
        const newRow = {
            id: Math.max(...(modalProducts || []).map(p => p.id || 0)) + 1,
            code: '',
            location: '',
            inventoryStatus: 'Daily'
        };
        const updatedProducts = [...(modalProducts || []), newRow];
        setModalProducts(updatedProducts);
        setFilteredModalProducts(updatedProducts);
    };

    const menuItems = [
        {
            label: 'Add Row',
            icon: 'pi pi-plus',
            command: addModalRow,
            disabled: !isEditMode
        },
        { separator: true },
        {
            label: 'Column Customize',
            icon: 'pi pi-table',
            command: openCustomizeModal
        },
        { separator: true },
        {
            label: isModalMaximized ? 'Exit Fullscreen' : 'Fullscreen',
            icon: isModalMaximized ? 'pi pi-window-minimize' : 'pi pi-window-maximize',
            command: toggleModalMaximize,
            className: isModalMaximized ? 'menu-exit-fullscreen' : ''
        }
    ];

    const codeEditorWithValidation = (options) => {
        const currentCode = options.value?.trim().toLowerCase();
        
        // Get all existing codes from current modal (except current row)
        const existingCodesInCurrentModal = modalProducts
            .filter(p => p.id !== options.rowData.id)
            .map(p => p.code?.trim().toLowerCase());
        
        // Get all existing codes from other flex tables
        const existingCodesInOtherModals = [];
        Object.keys(rowModalData).forEach(mainRowId => {
            // Skip if it's the current selected row
            if (selectedRow && mainRowId === selectedRow.id.toString()) {
                return;
            }
            
            const otherModalProducts = rowModalData[mainRowId] || [];
            otherModalProducts.forEach(product => {
                const code = product.code?.trim().toLowerCase();
                if (code) existingCodesInOtherModals.push(code);
            });
        });
        
        // Combine all existing codes
        const allExistingCodes = [...existingCodesInCurrentModal, ...existingCodesInOtherModals];
        const isDuplicate = currentCode && allExistingCodes.includes(currentCode);
        
        return (
            <div style={{ position: 'relative' }}>
                <InputText 
                    type="text" 
                    value={options.value} 
                    onChange={(e) => options.editorCallback(e.target.value)}
                    className={isDuplicate ? 'p-invalid' : ''}
                    style={isDuplicate ? { 
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    } : {}}
                />
                {isDuplicate && (
                    <small style={{ 
                        color: '#ef4444', 
                        fontSize: '10px',
                        position: 'absolute',
                        bottom: '-18px',
                        left: '0',
                        whiteSpace: 'nowrap'
                    }}>
                        ⚠️ Duplicate code!
                    </small>
                )}
            </div>
        );
    };

    const getColumnEditor = (field) => {
        switch (field) {
            case 'inventoryStatus':
                return deliveryEditor;
            case 'code':
                return codeEditorWithValidation;
            case 'location':
            default:
                return textEditor;
        }
    };

    const getColumnBody = (field) => {
        switch (field) {
            case 'inventoryStatus':
                return statusBodyTemplate;
            case 'code':
                return codeBodyTemplate;
            default:
                return null;
        }
    };

    const codeBodyTemplate = (rowData) => {
        const isDuplicate = hasDuplicateCode(rowData);
        
        if (isDuplicate) {
            return (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '6px',
                    color: '#ef4444',
                    fontWeight: 'bold'
                }}>
                    <i className="pi pi-exclamation-triangle" style={{ fontSize: '14px' }}></i>
                    {rowData.code}
                </div>
            );
        }
        
        return rowData.code;
    };

    const modalHeaderTemplate = () => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        Route {selectedRow?.code || ''}
                    </div>
                    <div style={{ fontSize: '12px', opacity: '0.6' }}>
                        {selectedRow?.name || ''} | {selectedRow?.inventoryStatus || ''}
                    </div>
                </div>
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
                    <button
                        onClick={(e) => {
                            menuRef.current.toggle(e);
                            setIsFlexMenuOpen(!isFlexMenuOpen);
                        }}
                        className="hamburger-button menu-button-large"
                        aria-label="Menu"
                    >
                        <div className={`hamburger-icon ${isFlexMenuOpen ? 'open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                    <OverlayPanel 
                        ref={menuRef} 
                        appendTo={document.body} 
                        style={{ width: '250px' }}
                        onHide={() => setIsFlexMenuOpen(false)}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Button
                                label="Add Row"
                                icon="pi pi-plus"
                                className="p-button-text p-button-plain"
                                onClick={() => {
                                    addModalRow();
                                    menuRef.current.hide();
                                    setIsFlexMenuOpen(false);
                                }}
                                disabled={!isEditMode}
                                style={{ justifyContent: 'flex-start' }}
                            />
                            <div style={{ borderTop: '1px solid var(--surface-border)', margin: '4px 0' }} />
                            <Button
                                label="Column Customize"
                                icon="pi pi-table"
                                className="p-button-text p-button-plain"
                                onClick={() => {
                                    openCustomizeModal();
                                    menuRef.current.hide();
                                    setIsFlexMenuOpen(false);
                                }}
                                style={{ justifyContent: 'flex-start' }}
                            />
                            <div style={{ borderTop: '1px solid var(--surface-border)', margin: '4px 0' }} />
                            <Button
                                label={isModalMaximized ? 'Exit Fullscreen' : 'Fullscreen'}
                                icon={isModalMaximized ? 'pi pi-window-minimize' : 'pi pi-window-maximize'}
                                className="p-button-text p-button-plain"
                                onClick={() => {
                                    toggleModalMaximize();
                                    menuRef.current.hide();
                                    setIsFlexMenuOpen(false);
                                }}
                                style={{ justifyContent: 'flex-start' }}
                            />
                        </div>
                    </OverlayPanel>
                </div>
            </div>
        );
    };

    const columnOptions = allColumns.map(col => ({
        label: col.header,
        value: col.field
    }));

    const onOpenInfoModal = (rowData) => {
        // Add mock data for demonstration - you can replace with actual data
        const locationData = {
            code: rowData.code,
            location: rowData.location || rowData.code,
            inventoryStatus: rowData.inventoryStatus,
            kilometer: '2.5 Km', // Mock data
            latitude: '3.1390',  // Mock data
            longitude: '101.6869' // Mock data
        };
        setSelectedLocationInfo(locationData);
        setInfoModalVisible(true);
    };

    const actionBodyTemplate = (rowData) => {
        const changesCount = rowChangesCounts[rowData.id] || 0;
        
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Button
                        icon="pi pi-list"
                        text
                        onClick={() => onOpenFlexTableModal(rowData)}
                        tooltip="Open Flex Table"
                        tooltipOptions={{ position: 'bottom' }}
                    />
                    {changesCount > 0 && (
                        <Badge 
                            value={changesCount} 
                            severity="warning"
                            style={{ 
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                transform: 'translate(50%, -50%)'
                            }}
                        />
                    )}
                </div>
            </div>
        );
    };

    const deleteButtonTemplate = (rowData) => {
        const isEditing = editingRows[rowData.id] !== undefined;
        
        if (!isEditing) return null;
        
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Delete"
                    tooltipOptions={{ position: 'bottom' }}
                />
            </div>
        );
    };

    const modalActionBodyTemplate = (rowData) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Button
                    icon="pi pi-info-circle"
                    text
                    onClick={() => onOpenInfoModal(rowData)}
                    tooltip="View Info"
                    tooltipOptions={{ position: 'bottom' }}
                />
            </div>
        );
    };

    const modalDeleteButtonTemplate = (rowData) => {
        const isEditing = modalEditingRows[rowData.id] !== undefined;
        
        if (!isEditing) return null;
        
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    onClick={() => confirmModalDelete(rowData)}
                    tooltip="Delete"
                    tooltipOptions={{ position: 'bottom' }}
                />
            </div>
        );
    };

    const rowClassName = (rowData) => {
        return preSavedRows[rowData.id] ? 'pre-saved-row' : '';
    };

    const modalRowClassName = (rowData) => {
        // Check for duplicate code first
        if (hasDuplicateCode(rowData)) {
            return 'duplicate-row';
        }
        
        // Then check for pre-saved status
        if (selectedRow && modalPreSavedRows[selectedRow.id]) {
            return modalPreSavedRows[selectedRow.id][rowData.id] ? 'pre-saved-row' : '';
        }
        return '';
    };

    // Add function to check if row should be editable
    const allowModalEdit = (rowData) => {
        return !hasDuplicateCode(rowData);
    };

    return (
        <div className="card p-fluid">
            <div className="table-wrapper">
                <DataTable key={`table-${dataVersion}`} value={products} editMode="row" dataKey="id" onRowEditComplete={onRowEditComplete} editingRows={editingRows} onRowEditChange={(e) => setEditingRows(e.data)} tableStyle={{ minWidth: '50rem' }} scrollable scrollHeight="450px" rowClassName={rowClassName}>
                <Column field="code" header="Route" editor={isEditMode ? (options) => textEditor(options) : null} style={{ width: '25%' }} headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
                <Column field="name" header="Warehouse" editor={isEditMode ? (options) => textEditor(options) : null} style={{ width: '25%' }} headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
                <Column field="inventoryStatus" header="Shift" body={statusBodyTemplate} editor={isEditMode ? (options) => shiftEditor(options) : null} style={{ width: '20%' }} headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
                <Column header="Action" body={actionBodyTemplate} exportable={false} style={{ width: '10%', minWidth: '8rem' }} headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
                <Column body={deleteButtonTemplate} exportable={false} style={{ width: '5%', minWidth: '4rem' }} headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
                {isEditMode && <Column rowEditor={allowEdit} header="Editable" headerStyle={{ width: '10%', minWidth: '8rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>}
            </DataTable>
            </div>

            <Dialog
                header={modalHeaderTemplate()}
                visible={showFlexTableModal}
                style={isModalMaximized ? { width: '100vw', height: '100vh' } : { width: '75vw' }}
                modal
                dismissableMask
                closable={false}
                closeOnEscape={false}
                contentStyle={isModalMaximized ? { height: 'calc(100vh - 150px)' } : { height: '350px' }}
                onHide={() => {
                    // Save modal data to the specific row before closing
                    if (selectedRow) {
                        setRowModalData(prev => ({
                            ...prev,
                            [selectedRow.id]: modalProducts
                        }));
                        // Update badge count with changes from this session
                        if (currentModalChanges > 0) {
                            setRowChangesCounts(prev => ({
                                ...prev,
                                [selectedRow.id]: (prev[selectedRow.id] || 0) + currentModalChanges
                            }));
                        }
                    }
                    setShowFlexTableModal(false);
                    setIsModalMaximized(false);
                    setGlobalFilter('');
                    setCurrentModalChanges(0);
                    // Clear modal editing rows but keep markers for review
                    setModalEditingRows({});
                    // Force table re-render
                    setDataVersion(v => v + 1);
                }}
                footer={<Button label="Ok" icon="pi pi-check" onClick={() => {
                    // Save modal data to the specific row
                    if (selectedRow) {
                        setRowModalData(prev => ({
                            ...prev,
                            [selectedRow.id]: modalProducts
                        }));
                        // Update badge count with changes from this session
                        if (currentModalChanges > 0) {
                            setRowChangesCounts(prev => ({
                                ...prev,
                                [selectedRow.id]: (prev[selectedRow.id] || 0) + currentModalChanges
                            }));
                        }
                    }
                    setShowFlexTableModal(false);
                    setCurrentModalChanges(0);
                    // Clear modal editing rows but keep markers for review
                    setModalEditingRows({});
                    // Force table re-render
                    setDataVersion(v => v + 1);
                }} />}
            >
                <DataTable
                    value={filteredModalProducts}
                    scrollable
                    scrollHeight="flex"
                    tableStyle={{ minWidth: '50rem' }}
                    editMode="row"
                    dataKey="id"
                    onRowEditComplete={onModalRowEditComplete}
                    editingRows={modalEditingRows}
                    onRowEditChange={(e) => setModalEditingRows(e.data)}
                    rowClassName={modalRowClassName}
                >
                    <Column
                        header="No"
                        body={(data, options) => options.rowIndex + 1}
                        style={{ width: '5%' }}
                        headerStyle={{ textAlign: 'center' }}
                        bodyStyle={{ textAlign: 'center' }}
                    />
                    {allColumns
                        .filter(col => visibleColumns.includes(col.field))
                        .map((col) => (
                            <Column
                                key={col.field}
                                field={col.field}
                                header={col.header}
                                editor={isEditMode ? getColumnEditor(col.field) : null}
                                body={getColumnBody(col.field)}
                                headerStyle={{ textAlign: 'center' }}
                                bodyStyle={{ textAlign: 'center' }}
                            />
                        ))
                    }
                    <Column
                        header="Action"
                        body={modalActionBodyTemplate}
                        exportable={false}
                        style={{ width: '10%', minWidth: '8rem' }}
                        headerStyle={{ textAlign: 'center' }}
                        bodyStyle={{ textAlign: 'center' }}
                    />
                    <Column 
                        body={modalDeleteButtonTemplate} 
                        exportable={false} 
                        style={{ width: '5%', minWidth: '4rem' }} 
                        headerStyle={{ textAlign: 'center' }} 
                        bodyStyle={{ textAlign: 'center' }}
                    />
                    {isEditMode && (
                        <Column
                            header="Editable"
                            rowEditor={allowModalEdit}
                            headerStyle={{ width: '10%', minWidth: '8rem', textAlign: 'center' }}
                            bodyStyle={{ textAlign: 'center' }}
                        />
                    )}
                </DataTable>

                <Dialog
                    header="Customize Columns"
                    visible={customizeModalVisible}
                    style={{ width: '450px' }}
                    modal
                    dismissableMask
                    onHide={cancelColumnCustomization}
                    footer={
                        <div>
                            <Button label="Cancel" icon="pi pi-times" onClick={cancelColumnCustomization} className="p-button-text" />
                            <Button label="Apply" icon="pi pi-check" onClick={applyColumnCustomization} autoFocus />
                        </div>
                    }
                >
                    <div style={{ padding: '1rem 0' }}>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-color-secondary)' }}>
                            Select which columns to display in the table
                        </p>
                        <div className="column-customize-list">
                            {allColumns.map((col) => (
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
            </Dialog>

            {/* Info Modal with Card and Map - Huijack Style */}
            <Dialog 
                visible={infoModalVisible}
                style={{ width: '70vw', maxWidth: '900px' }}
                modal
                onHide={() => setInfoModalVisible(false)}
                contentStyle={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}
                headerStyle={{ display: 'none' }}
                dismissableMask
                className="info-modal-dialog"
            >
                {selectedLocationInfo && (
                    <div className="info-modal-container">
                        {/* Map Header */}
                        <div className="info-map-wrapper">
                            <iframe
                                title="location-map"
                                width="100%"
                                height="250"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.8!2d${selectedLocationInfo.longitude || '101.6869'}!3d${selectedLocationInfo.latitude || '3.1390'}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwMDgnMjEuMiJOIDEwMcKwMzUnMDYuNCJF!5e0!3m2!1sen!2smy!4v1234567890`}
                                allowFullScreen
                            ></iframe>
                            <div className="map-overlay-badge">
                                <i className="pi pi-map-marker"></i>
                                Location Details
                            </div>
                        </div>

                        {/* Content */}
                        <div className="info-modal-content">
                            {/* Header Section */}
                            <div className="info-header-section">
                                <div className="info-title-wrapper">
                                    <h2 className="info-title">{selectedLocationInfo.location || selectedLocationInfo.code}</h2>
                                    <span className="info-code-badge">#{selectedLocationInfo.code}</span>
                                </div>
                                <span className={`delivery-type-badge ${(selectedLocationInfo.inventoryStatus || 'standard').toLowerCase()}`}>
                                    <i className="pi pi-truck"></i>
                                    {selectedLocationInfo.inventoryStatus || 'Standard'}
                                </span>
                            </div>

                            {/* Info Grid */}
                            <div className="info-grid-container">
                                <div className="info-grid-item">
                                    <div className="info-icon-wrapper distance">
                                        <i className="pi pi-compass"></i>
                                    </div>
                                    <div className="info-text-wrapper">
                                        <span className="info-label">Distance</span>
                                        <span className="info-value">{selectedLocationInfo.kilometer || '0.0 Km'}</span>
                                    </div>
                                </div>

                                <div className="info-grid-item">
                                    <div className="info-icon-wrapper delivery">
                                        <i className="pi pi-send"></i>
                                    </div>
                                    <div className="info-text-wrapper">
                                        <span className="info-label">Delivery Type</span>
                                        <span className="info-value">{selectedLocationInfo.inventoryStatus || 'Standard'}</span>
                                    </div>
                                </div>

                                <div className="info-grid-item full-width">
                                    <div className="info-icon-wrapper coordinates">
                                        <i className="pi pi-globe"></i>
                                    </div>
                                    <div className="info-text-wrapper">
                                        <span className="info-label">GPS Coordinates</span>
                                        <span className="info-value coordinates-value">
                                            <span className="coordinate-item">
                                                <i className="pi pi-angle-up"></i> {selectedLocationInfo.latitude || '3.1390'}°
                                            </span>
                                            <span className="coordinate-separator">•</span>
                                            <span className="coordinate-item">
                                                <i className="pi pi-angle-right"></i> {selectedLocationInfo.longitude || '101.6869'}°
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="quick-actions-section">
                                <button className="quick-action-btn primary">
                                    <i className="pi pi-directions"></i>
                                    Get Directions
                                </button>
                                <button className="quick-action-btn secondary">
                                    <i className="pi pi-share-alt"></i>
                                    Share Location
                                </button>
                            </div>

                            {/* Footer Actions */}
                            <div className="info-modal-footer">
                                <Button 
                                    label="Close" 
                                    icon="pi pi-times" 
                                    className="p-button-text"
                                    onClick={() => setInfoModalVisible(false)}
                                />
                                <Button 
                                    label="Save to Route" 
                                    icon="pi pi-check" 
                                    onClick={() => setInfoModalVisible(false)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
