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
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ProductService } from './service/ProductService';

export default function RowEditingDemo({ onAddRowRegister }) {
    const [products, setProducts] = useState(null);
    const [statuses] = useState(['AM', 'PM']);
    const [showFlexTableModal, setShowFlexTableModal] = useState(false);
    
    // Flex Table Modal States
    const [modalProducts, setModalProducts] = useState([]);
    const [filteredModalProducts, setFilteredModalProducts] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(['name', 'category', 'quantity', 'price']);
    const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
    const [tempVisibleColumns, setTempVisibleColumns] = useState([]);
    const [isModalMaximized, setIsModalMaximized] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = React.useRef(null);

    const allColumns = [
        { field: 'name', header: 'Name' },
        { field: 'category', header: 'Category' },
        { field: 'quantity', header: 'Quantity' },
        { field: 'price', header: 'Price' },
        { field: 'inventoryStatus', header: 'Status' }
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
        if (globalFilter === '') {
            setFilteredModalProducts(modalProducts);
        } else {
            const filtered = modalProducts.filter((product) => {
                return (
                    product.name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    product.category?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    product.inventoryStatus?.toLowerCase().includes(globalFilter.toLowerCase())
                );
            });
            setFilteredModalProducts(filtered);
        }
    }, [globalFilter, modalProducts]);

    useEffect(() => {
        if (menuOpen) {
            document.body.classList.add('menu-open');
            const dialogContent = document.querySelector('.p-dialog');
            if (dialogContent) {
                dialogContent.classList.add('dialog-blurred');
            }
        } else {
            document.body.classList.remove('menu-open');
            const dialogContent = document.querySelector('.p-dialog');
            if (dialogContent) {
                dialogContent.classList.remove('dialog-blurred');
            }
        }
        
        return () => {
            document.body.classList.remove('menu-open');
            const dialogContent = document.querySelector('.p-dialog');
            if (dialogContent) {
                dialogContent.classList.remove('dialog-blurred');
            }
        };
    }, [menuOpen]);

    const getSeverity = (value) => {
        switch (value) {
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
    };

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };

    const statusEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={statuses}
                onChange={(e) => options.editorCallback(e.value)}
                placeholder="Select a Status"
                itemTemplate={(option) => {
                    return <Tag value={option} severity={getSeverity(option)}></Tag>;
                }}
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

    const onOpenFlexTableModal = () => {
        // Load products for modal
        ProductService.getProductsMini().then((data) => {
            setModalProducts(data);
            setFilteredModalProducts(data);
        });
        setShowFlexTableModal(true);
    };

    const onModalRowEditComplete = (e) => {
        let _products = [...modalProducts];
        let { newData, index } = e;
        _products[index] = newData;
        setModalProducts(_products);
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

    const menuItems = [
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
            case 'price':
                return priceEditor;
            case 'quantity':
                return (options) => <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} />;
            case 'inventoryStatus':
                return statusEditor;
            default:
                return textEditor;
        }
    };

    const getColumnBody = (field) => {
        switch (field) {
            case 'price':
                return priceBodyTemplate;
            case 'inventoryStatus':
                return statusBodyTemplate;
            default:
                return null;
        }
    };

    const modalHeaderTemplate = () => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>Editable Flex Table</span>
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
                        onShow={() => setMenuOpen(true)}
                        onHide={() => setMenuOpen(false)}
                        style={{ width: '300px' }}
                        appendTo={document.body}
                    />
                </div>
            </div>
        );
    };

    const columnOptions = allColumns.map(col => ({
        label: col.header,
        value: col.field
    }));

    const actionBodyTemplate = (rowData) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Button
                    icon="pi pi-list"
                    text
                    onClick={onOpenFlexTableModal}
                    tooltip="Open Flex Table"
                    tooltipOptions={{ position: 'bottom' }}
                />
                <Button
                    icon="pi pi-trash"
                    text
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Delete"
                    tooltipOptions={{ position: 'bottom' }}
                />
            </div>
        );
    };

    return (
        <div className="card p-fluid">
            <ConfirmDialog />
            <div className="table-wrapper">
                <DataTable value={products} editMode="row" dataKey="id" onRowEditComplete={onRowEditComplete} tableStyle={{ minWidth: '50rem' }} scrollable scrollHeight="600px">
                <Column field="code" header="Route" editor={(options) => textEditor(options)} style={{ width: '25%' }} headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
                <Column field="name" header="Warehouse" editor={(options) => textEditor(options)} style={{ width: '25%' }} headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
                <Column field="inventoryStatus" header="Shift" body={statusBodyTemplate} editor={(options) => statusEditor(options)} style={{ width: '20%' }} headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
                <Column header="Action" body={actionBodyTemplate} exportable={false} style={{ width: '10%', minWidth: '8rem' }} headerStyle={{ textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
                <Column rowEditor={allowEdit} header="Editable" headerStyle={{ width: '10%', minWidth: '8rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}></Column>
            </DataTable>
            </div>

            <Dialog
                header={modalHeaderTemplate()}
                visible={showFlexTableModal}
                style={isModalMaximized ? { width: '100vw', height: '100vh' } : { width: '75vw' }}
                modal
                closable={false}
                closeOnEscape={false}
                contentStyle={isModalMaximized ? { height: 'calc(100vh - 150px)' } : { height: '500px' }}
                onHide={() => {
                    setShowFlexTableModal(false);
                    setIsModalMaximized(false);
                    setGlobalFilter('');
                }}
                footer={<Button label="Ok" icon="pi pi-check" onClick={() => setShowFlexTableModal(false)} />}
            >
                <DataTable
                    value={filteredModalProducts}
                    scrollable
                    scrollHeight="flex"
                    tableStyle={{ minWidth: '50rem' }}
                    editMode="row"
                    dataKey="id"
                    onRowEditComplete={onModalRowEditComplete}
                >
                    {allColumns
                        .filter(col => visibleColumns.includes(col.field))
                        .map((col) => (
                            <Column
                                key={col.field}
                                field={col.field}
                                header={col.header}
                                editor={getColumnEditor(col.field)}
                                body={getColumnBody(col.field)}
                                headerStyle={{ textAlign: 'center' }}
                                bodyStyle={{ textAlign: 'center' }}
                            />
                        ))
                    }
                    <Column
                        rowEditor
                        headerStyle={{ width: '10%', minWidth: '8rem' }}
                        bodyStyle={{ textAlign: 'center' }}
                    />
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
        </div>
    );
}
