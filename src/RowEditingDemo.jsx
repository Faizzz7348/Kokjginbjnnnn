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

export default function RowEditingDemo({ onAddRowRegister, isEditMode, onSaveRegister }) {
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
        let { newData, index } = e;
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

    const getColumnEditor = (field) => {
        switch (field) {
            case 'inventoryStatus':
                return deliveryEditor;
            case 'code':
            case 'location':
            default:
                return textEditor;
        }
    };

    const getColumnBody = (field) => {
        switch (field) {
            case 'inventoryStatus':
                return statusBodyTemplate;
            default:
                return null;
        }
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
                        popupAlignment="right"
                    />
                </div>
            </div>
        );
    };

    const columnOptions = allColumns.map(col => ({
        label: col.header,
        value: col.field
    }));

    const onOpenInfoModal = (rowData) => {
        setSelectedInfoRow(rowData);
        setShowInfoModal(true);
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
        if (selectedRow && modalPreSavedRows[selectedRow.id]) {
            return modalPreSavedRows[selectedRow.id][rowData.id] ? 'pre-saved-row' : '';
        }
        return '';
    };

    return (
        <div className="card p-fluid">
            <ConfirmDialog />
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
                            rowEditor
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

            {/* Info Modal with Card and Map */}
            <Dialog
                header="Location Information"
                visible={showInfoModal}
                style={{ width: '50vw' }}
                modal
                onHide={() => setShowInfoModal(false)}
                footer={
                    <div>
                        <Button label="Close" icon="pi pi-times" onClick={() => setShowInfoModal(false)} />
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Card 
                        title={selectedInfoRow?.code || 'Location'} 
                        style={{ width: '100%' }}
                    >
                        {/* Leaflet Map */}
                        <div style={{ 
                            width: '100%', 
                            height: '300px', 
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '1rem'
                        }}>
                            <MapContainer 
                                center={[3.1390, 101.6869]} 
                                zoom={13} 
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[3.1390, 101.6869]}>
                                    <Popup>
                                        {selectedInfoRow?.location || 'Location'}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>

                        <div>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Code:</strong> {selectedInfoRow?.code || 'N/A'}</p>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Location:</strong> {selectedInfoRow?.location || 'N/A'}</p>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Delivery:</strong> {selectedInfoRow?.inventoryStatus || 'N/A'}</p>
                        </div>
                    </Card>
                </div>
            </Dialog>
        </div>
    );
}
