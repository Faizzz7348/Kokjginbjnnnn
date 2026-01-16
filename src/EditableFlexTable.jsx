import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { ProductService } from './service/ProductService';

export default function EditableFlexTable() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(['name', 'category', 'quantity', 'price']);
    const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
    const [tempVisibleColumns, setTempVisibleColumns] = useState([]);
    const [isMaximized, setIsMaximized] = useState(false);
    const [statuses] = useState(['INSTOCK', 'LOWSTOCK', 'OUTOFSTOCK']);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const allColumns = [
        { field: 'name', header: 'Name' },
        { field: 'category', header: 'Category' },
        { field: 'quantity', header: 'Quantity' },
        { field: 'price', header: 'Price' },
        { field: 'inventoryStatus', header: 'Status' }
    ];

    useEffect(() => {
        ProductService.getProductsMini().then((data) => {
            setProducts(data);
            setFilteredProducts(data);
        });
    }, []);

    useEffect(() => {
        if (globalFilter === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter((product) => {
                return (
                    product.name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    product.category?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    product.inventoryStatus?.toLowerCase().includes(globalFilter.toLowerCase())
                );
            });
            setFilteredProducts(filtered);
        }
    }, [globalFilter, products]);

    const getSeverity = (value) => {
        switch (value) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warning';
            case 'OUTOFSTOCK':
                return 'danger';
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

    const priceEditor = (options) => {
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} mode="currency" currency="USD" locale="en-US" />;
    };

    const quantityEditor = (options) => {
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} />;
    };

    const statusEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={statuses}
                onChange={(e) => options.editorCallback(e.value)}
                placeholder="Select a Status"
            />
        );
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.inventoryStatus} severity={getSeverity(rowData.inventoryStatus)}></Tag>;
    };

    const priceBodyTemplate = (rowData) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rowData.price);
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

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Editable Flex Table</h3>
                <Button 
                    icon="pi pi-cog" 
                    onClick={openCustomizeModal}
                    severity="secondary"
                    rounded
                    text
                    tooltip="Customize Columns"
                    tooltipOptions={{ position: 'bottom' }}
                />
                <Button 
                    icon={isMaximized ? "pi pi-window-minimize" : "pi pi-window-maximize"}
                    onClick={toggleMaximize}
                    severity="secondary"
                    rounded
                    text
                    tooltip={isMaximized ? "Restore" : "Maximize"}
                    tooltipOptions={{ position: 'bottom' }}
                />
            </div>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                />
            </span>
        </div>
    );

    const columnOptions = allColumns.map(col => ({
        label: col.header,
        value: col.field
    }));

    const getColumnEditor = (field) => {
        switch (field) {
            case 'price':
                return priceEditor;
            case 'quantity':
                return quantityEditor;
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

    const onShowProduct = (rowData) => {
        setSelectedProduct(rowData);
        setShowDialog(true);
    };

    const onOpenFlexTable = () => {
        setIsMaximized(true);
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Button
                    icon="pi pi-eye"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={onOpenFlexTable}
                    tooltip="Open Flex Table"
                    tooltipOptions={{ position: 'bottom' }}
                />
            </div>
        );
    };

    return (
        <div style={{ 
            height: isMaximized ? '100vh' : 'auto',
            width: isMaximized ? '100vw' : '100%',
            position: isMaximized ? 'fixed' : 'relative',
            top: isMaximized ? 0 : 'auto',
            left: isMaximized ? 0 : 'auto',
            zIndex: isMaximized ? 9999 : 1,
            backgroundColor: 'var(--surface-ground)',
            padding: isMaximized ? '2rem' : '0'
        }}>
            <DataTable
                value={filteredProducts}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                dataKey="id"
                header={header}
                scrollable
                scrollHeight={isMaximized ? "calc(100vh - 200px)" : "400px"}
                editMode="row"
                onRowEditComplete={onRowEditComplete}
                tableStyle={{ minWidth: '50rem' }}
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
                            style={{ width: '20%' }}
                        />
                    ))
                }
                <Column
                    header="Actions"
                    body={actionBodyTemplate}
                    exportable={false}
                    style={{ width: '8%', minWidth: '8rem' }}
                    headerStyle={{ textAlign: 'center' }}
                    bodyStyle={{ textAlign: 'center' }}
                />
                <Column
                    rowEditor
                    headerStyle={{ width: '10%', minWidth: '8rem' }}
                    bodyStyle={{ textAlign: 'center' }}
                />
            </DataTable>

            <Dialog
                header="Customize Columns"
                visible={customizeModalVisible}
                style={{ width: '30vw' }}
                onHide={cancelColumnCustomization}
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" onClick={cancelColumnCustomization} severity="secondary" />
                        <Button label="Apply" icon="pi pi-check" onClick={applyColumnCustomization} autoFocus />
                    </div>
                }
            >
                <div style={{ padding: '1rem 0' }}>
                    <label htmlFor="column-selector" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Select Visible Columns:
                    </label>
                    <MultiSelect
                        id="column-selector"
                        value={tempVisibleColumns}
                        options={columnOptions}
                        onChange={(e) => setTempVisibleColumns(e.value)}
                        placeholder="Select Columns"
                        display="chip"
                        style={{ width: '100%' }}
                    />
                </div>
            </Dialog>

            <Dialog
                visible={showDialog}
                style={{ width: '450px' }}
                header="Product Details"
                modal
                onHide={() => setShowDialog(false)}
            >
                {selectedProduct && (
                    <div style={{ padding: '1rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Name:</strong> {selectedProduct.name}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Category:</strong> {selectedProduct.category}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Quantity:</strong> {selectedProduct.quantity}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Price:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedProduct.price)}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Status:</strong> <Tag value={selectedProduct.inventoryStatus} severity={getSeverity(selectedProduct.inventoryStatus)}></Tag>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
