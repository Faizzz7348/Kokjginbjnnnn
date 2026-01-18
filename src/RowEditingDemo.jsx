import React, { useEffect, useState, useMemo } from 'react';
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
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-fullscreen.css';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import { PowerModeModal } from './components/PowerModeModal';

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
    const [visibleColumns, setVisibleColumns] = useState(['code', 'location', 'inventoryStatus', 'images']);
    const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
    const [tempVisibleColumns, setTempVisibleColumns] = useState([]);
    const [isModalMaximized, setIsModalMaximized] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedInfoRow, setSelectedInfoRow] = useState(null);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [selectedLocationInfo, setSelectedLocationInfo] = useState(null);
    const [isFlexMenuOpen, setIsFlexMenuOpen] = useState(false);
    const [isAddressExpanded, setIsAddressExpanded] = useState(false);
    const [pinnedRows, setPinnedRows] = useState(new Set());
    const menuRef = React.useRef(null);
    const lightGalleryRef = React.useRef(null);
    const [galleryItems, setGalleryItems] = useState([]);
    const [selectedRowForImage, setSelectedRowForImage] = useState(null);
    const [imageUploadDialogVisible, setImageUploadDialogVisible] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [imageCaptionInput, setImageCaptionInput] = useState('');
    const [powerModalVisible, setPowerModalVisible] = useState(false);
    const [selectedPowerRow, setSelectedPowerRow] = useState(null);

    // Memoize sorted products to prevent infinite re-renders
    const sortedProducts = useMemo(() => {
        if (!products) return null;
        return [...products].sort((a, b) => {
            const aIsPinned = pinnedRows.has(a.id);
            const bIsPinned = pinnedRows.has(b.id);
            if (aIsPinned && !bIsPinned) return -1;
            if (!aIsPinned && bIsPinned) return 1;
            return 0;
        });
    }, [products, pinnedRows]);

    const allColumns = [
        { field: 'code', header: 'Code' },
        { field: 'location', header: 'Location' },
        { field: 'inventoryStatus', header: 'Delivery' },
        { field: 'images', header: 'Images' }
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

    // Clear all editing states when exiting edit mode
    useEffect(() => {
        if (!isEditMode) {
            setEditingRows({});
            setModalEditingRows({});
        }
    }, [isEditMode]);

    // Reset address expanded state when modal opens
    useEffect(() => {
        if (infoModalVisible) {
            setIsAddressExpanded(false);
        }
    }, [infoModalVisible]);

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
        return rowData.inventoryStatus;
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
        
        // Preserve images from original row data (images not edited in form)
        const originalRow = modalProducts[index];
        newData.images = originalRow.images || [];
        
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
                return textEditor;
            case 'images':
                return null; // Images tidak editable via field, gunakan pencil icon
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
            case 'images':
                return imageBodyTemplate;
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

    // Image Body Template untuk display images
    const imageBodyTemplate = (rowData) => {
        const images = rowData.images || [];
        // Check if row is being edited in either main table or modal table
        const isRowBeingEdited = (editingRows && editingRows[rowData.id]) || 
                                  (modalEditingRows && modalEditingRows[rowData.id]);
        
        if (!images || images.length === 0) {
            return (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    position: 'relative'
                }}>
                    <div style={{ 
                        position: 'relative',
                        display: 'inline-block'
                    }}>
                        <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '80px',
                            height: '40px',
                            borderRadius: '0.5rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            position: 'relative',
                            cursor: isEditMode ? 'pointer' : 'default'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px'
                            }}>
                                <i className="pi pi-image" style={{ 
                                    fontSize: '1rem', 
                                    color: '#94a3b8',
                                    opacity: 0.5
                                }}></i>
                                <span style={{ 
                                    fontSize: '0.65rem', 
                                    color: '#94a3b8',
                                    fontWeight: '500'
                                }}>
                                    No Image
                                </span>
                            </div>
                        </div>
                        
                        {/* Pencil icon - show bila row dalam edit mode */}
                        {isEditMode && isRowBeingEdited && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openImageUpload(rowData);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: '#2196f3',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    zIndex: 10,
                                    animation: 'fadeInScale 0.3s ease-out'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1976d2';
                                    e.currentTarget.style.transform = 'scale(1.2) rotate(15deg)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#2196f3';
                                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                                }}
                                title="Add Images"
                            >
                                <i className="pi pi-pencil" style={{ fontSize: '0.65rem', color: 'white' }}></i>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Convert string array to proper image format
        const imageArray = images.map(img => 
            typeof img === 'string' ? { url: img, caption: '' } : img
        );

        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                position: 'relative'
            }}>
                <div 
                    style={{ 
                        position: 'relative',
                        display: 'inline-block'
                    }}
                >
                    <div
                        style={{ 
                            position: 'relative',
                            display: 'inline-block'
                        }}
                    >
                        <div
                            onClick={() => openLightbox(imageArray, 0)}
                            style={{ 
                                cursor: 'pointer',
                                position: 'relative',
                                width: '50px',
                                height: '40px'
                            }}
                        >
                            {imageArray.length > 0 && imageArray[0].url && (
                                <>
                                    <img 
                                        src={imageArray[0].url} 
                                        alt={imageArray[0].caption || 'Preview'}
                                        style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover', 
                                            borderRadius: '4px',
                                            border: '1px solid #e5e7eb',
                                            display: 'block',
                                            transition: 'opacity 0.3s'
                                        }}
                                        onError={(e) => {
                                            console.error('Image failed to load:', imageArray[0].url);
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    {/* Count badge inside image */}
                                    {imageArray.length > 1 && (
                                        <span style={{
                                            position: 'absolute',
                                            bottom: '3px',
                                            right: '3px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                            color: 'white',
                                            fontSize: '9px',
                                            fontWeight: '600',
                                            padding: '2px 5px',
                                            borderRadius: '3px',
                                            lineHeight: '1',
                                            pointerEvents: 'none',
                                            zIndex: 1
                                        }}>
                                            +{imageArray.length - 1}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        
                        {/* Pencil icon - hanya muncul bila row dalam edit mode */}
                        {isEditMode && isRowBeingEdited && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent lightbox from opening
                                    openImageUpload(rowData);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: '#2196f3',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    zIndex: 10,
                                    animation: 'fadeInScale 0.3s ease-out'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1976d2';
                                    e.currentTarget.style.transform = 'scale(1.2) rotate(15deg)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#2196f3';
                                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                                }}
                                title="Manage Images"
                            >
                                <i className="pi pi-pencil" style={{ fontSize: '0.65rem', color: 'white' }}></i>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Open Lightbox untuk view images
    const openLightbox = (images, index) => {
        const items = images.map(img => ({
            src: img.url,
            thumb: img.url,
            subHtml: `<h4>${img.caption || ''}</h4>${img.description ? `<p>${img.description}</p>` : ''}`
        }));
        setGalleryItems(items);
        
        // Trigger lightgallery to open
        setTimeout(() => {
            if (lightGalleryRef.current) {
                lightGalleryRef.current.openGallery(index);
            }
        }, 100);
    };

    // Open Image Upload Dialog
    const openImageUpload = (rowData) => {
        setSelectedRowForImage(rowData);
        setImageUrlInput('');
        setImageCaptionInput('');
        setImageUploadDialogVisible(true);
    };

    // Add Image to Row
    const addImageToRow = () => {
        if (!imageUrlInput.trim()) {
            alert('Please enter an image URL');
            return;
        }

        const _products = modalProducts.map(p => {
            if (p.id === selectedRowForImage.id) {
                const currentImages = p.images || [];
                const newImage = {
                    url: imageUrlInput.trim(),
                    caption: imageCaptionInput.trim() || '',
                    description: ''
                };
                return {
                    ...p,
                    images: [...currentImages, newImage]
                };
            }
            return p;
        });

        setModalProducts(_products);
        setFilteredModalProducts(_products);
        
        // Mark as pre-saved
        if (selectedRow) {
            setModalPreSavedRows(prev => ({
                ...prev,
                [selectedRow.id]: {
                    ...(prev[selectedRow.id] || {}),
                    [selectedRowForImage.id]: true
                }
            }));
        }
        
        setCurrentModalChanges(prev => prev + 1);
        setImageUploadDialogVisible(false);
        setImageUrlInput('');
        setImageCaptionInput('');
    };

    // Delete Image from Row
    const deleteImageFromRow = (rowData, imageIndex) => {
        confirmDialog({
            message: 'Are you sure you want to delete this image?',
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => {
                const _products = modalProducts.map(p => {
                    if (p.id === rowData.id) {
                        const currentImages = p.images || [];
                        return {
                            ...p,
                            images: currentImages.filter((_, idx) => idx !== imageIndex)
                        };
                    }
                    return p;
                });

                setModalProducts(_products);
                setFilteredModalProducts(_products);
                
                // Mark as pre-saved
                if (selectedRow) {
                    setModalPreSavedRows(prev => ({
                        ...prev,
                        [selectedRow.id]: {
                            ...(prev[selectedRow.id] || {}),
                            [rowData.id]: true
                        }
                    }));
                }
                
                setCurrentModalChanges(prev => prev + 1);
            }
        });
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
                                style={{ 
                                    justifyContent: 'flex-start',
                                    color: isModalMaximized ? '#ef4444' : undefined
                                }}
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
        // Load actual data from rowData - each row has unique info
        const locationData = {
            id: rowData.id,
            code: rowData.code,
            location: rowData.location || rowData.code,
            inventoryStatus: rowData.inventoryStatus,
            address: rowData.address || `No. ${rowData.id * 10 + 23}, Jalan Teknologi ${rowData.id}/4, Taman Sains Selangor ${rowData.id}, Kota Damansara, 47810 Petaling Jaya, Selangor, Malaysia`,
            latitude: rowData.latitude || (3.1390 + (rowData.id * 0.001)).toFixed(4),
            longitude: rowData.longitude || (101.6869 + (rowData.id * 0.001)).toFixed(4),
            operatingHours: rowData.operatingHours || '24/7 Access Available',
            machineType: rowData.machineType || 'Snack & Beverage Combo',
            paymentMethods: rowData.paymentMethods || 'Cash, Card, E-Wallet, QR Code',
            lastMaintenance: rowData.lastMaintenance || `${rowData.id || 2} days ago`,
            status: rowData.status || 'Active & Operational'
        };
        setSelectedLocationInfo(locationData);
        setInfoModalVisible(true);
    };

    const updateLocationInfo = (field, value) => {
        setSelectedLocationInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const togglePin = (rowData) => {
        setPinnedRows(prev => {
            const newPinned = new Set(prev);
            if (newPinned.has(rowData.id)) {
                newPinned.delete(rowData.id);
            } else {
                newPinned.add(rowData.id);
            }
            return newPinned;
        });
    };

    const actionBodyTemplate = (rowData) => {
        const changesCount = rowChangesCounts[rowData.id] || 0;
        const isPinned = pinnedRows.has(rowData.id);
        
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', position: 'relative' }}>
                <Button
                    icon={isPinned ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'}
                    rounded
                    text
                    severity={isPinned ? 'info' : undefined}
                    onClick={() => togglePin(rowData)}
                    className={isPinned ? 'pin-button-active' : 'pin-button'}
                />
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
                />
            </div>
        );
    };

    const modalActionBodyTemplate = (rowData) => {
        const isRowBeingEdited = modalEditingRows[rowData.id] !== undefined;

        const handlePowerClick = () => {
            setSelectedPowerRow(rowData);
            setPowerModalVisible(true);
        };

        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                {isRowBeingEdited && (
                    <Button
                        icon="pi pi-power-off"
                        text
                        onClick={handlePowerClick}
                        tooltip="Configure Power Mode"
                        tooltipOptions={{ position: 'top' }}
                        style={{ 
                            color: rowData.powerMode ? '#22c55e' : '#94a3b8',
                            cursor: 'pointer'
                        }}
                    />
                )}
                <Button
                    icon="pi pi-info-circle"
                    text
                    onClick={() => onOpenInfoModal(rowData)}
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
                />
            </div>
        );
    };

    const rowClassName = (rowData) => {
        if (pinnedRows.has(rowData.id)) {
            return 'pinned-row';
        }
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
        <>
            {isFlexMenuOpen && (
                <div 
                    className="menu-backdrop menu-backdrop-modal"
                    onClick={() => {
                        menuRef.current.hide();
                        setIsFlexMenuOpen(false);
                    }}
                />
            )}
        <div className="card p-fluid">
            <div className="table-wrapper">
                <DataTable 
                    key={`table-${dataVersion}`} 
                    value={sortedProducts} 
                    editMode="row" 
                    dataKey="id" 
                    onRowEditComplete={onRowEditComplete} 
                    editingRows={editingRows} 
                    onRowEditChange={(e) => setEditingRows(e.data)} 
                    tableStyle={{ minWidth: '50rem' }} 
                    scrollable 
                    scrollHeight="450px" 
                    rowClassName={rowClassName}
                >
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
                                style={{ 
                                    minWidth: col.field === 'code' ? '120px' : 
                                              col.field === 'location' ? '200px' : 
                                              col.field === 'inventoryStatus' ? '120px' : 
                                              col.field === 'images' ? '100px' : '150px'
                                }}
                                headerStyle={{ textAlign: 'center' }}
                                bodyStyle={{ 
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap'
                                }}
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
                style={{ width: '60vw', maxWidth: '700px', maxHeight: '90vh' }}
                modal
                onHide={() => setInfoModalVisible(false)}
                contentStyle={{ padding: 0, overflow: 'auto', borderRadius: '16px', maxHeight: '85vh' }}
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

                        {/* GPS Coordinates Section - Only in Edit Mode */}
                        {isEditMode && (
                            <div className="gps-coordinates-section">
                                <div className="gps-label">
                                    <i className="pi pi-map-marker"></i>
                                    <span>GPS Coordinates</span>
                                </div>
                                <div className="gps-inputs">
                                    <div className="gps-input-group">
                                        <label>Latitude</label>
                                        <InputText
                                            value={selectedLocationInfo.latitude || '3.1390'}
                                            onChange={(e) => updateLocationInfo('latitude', e.target.value)}
                                            className="gps-input"
                                            placeholder="3.1390"
                                        />
                                    </div>
                                    <div className="gps-input-group">
                                        <label>Longitude</label>
                                        <InputText
                                            value={selectedLocationInfo.longitude || '101.6869'}
                                            onChange={(e) => updateLocationInfo('longitude', e.target.value)}
                                            className="gps-input"
                                            placeholder="101.6869"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Collapsible Address Section */}
                        <div className="address-collapse-wrapper">
                            {!isAddressExpanded ? (
                                <button 
                                    className="address-collapse-btn"
                                    onClick={() => setIsAddressExpanded(true)}
                                >
                                    <span>Full Address</span>
                                    <i className="pi pi-chevron-down"></i>
                                </button>
                            ) : (
                                <>
                                    <div className="address-content">
                                        {isEditMode ? (
                                            <textarea
                                                value={selectedLocationInfo.address || 'No. 123, Jalan Teknologi 3/4, Taman Sains Selangor 1, Kota Damansara, 47810 Petaling Jaya, Selangor, Malaysia'}
                                                onChange={(e) => updateLocationInfo('address', e.target.value)}
                                                className="address-textarea"
                                                rows={3}
                                                placeholder="Enter full address"
                                            />
                                        ) : (
                                            <p className="address-text">
                                                {selectedLocationInfo.address || 
                                                 'No. 123, Jalan Teknologi 3/4, Taman Sains Selangor 1, Kota Damansara, 47810 Petaling Jaya, Selangor, Malaysia'}
                                            </p>
                                        )}
                                    </div>
                                    <button 
                                        className="address-collapse-btn collapse-bottom"
                                        onClick={() => setIsAddressExpanded(false)}
                                    >
                                        <i className="pi pi-chevron-up"></i>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Content */}
                        <div className="info-modal-content">
                            {/* Header Section */}
                            <div className="info-header-section">
                                <div className="info-title-wrapper">
                                    <h2 className="info-title">{selectedLocationInfo.code} - {selectedLocationInfo.location}</h2>
                                </div>
                                <span className={`delivery-type-badge ${(selectedLocationInfo.inventoryStatus || 'standard').toLowerCase()}`}>
                                    <i className="pi pi-truck"></i>
                                    {selectedLocationInfo.inventoryStatus || 'Standard'}
                                </span>
                            </div>

                            {/* Descriptions Section */}
                            <div className="descriptions-section">
                                <h3 className="descriptions-title">
                                    <i className="pi pi-info-circle"></i>
                                    Location Information
                                </h3>
                                <div className="description-items">
                                    <div className="description-item">
                                        <span className="description-label">Operating Hours:</span>
                                        {isEditMode ? (
                                            <InputText 
                                                value={selectedLocationInfo.operatingHours || '24/7 Access Available'}
                                                onChange={(e) => updateLocationInfo('operatingHours', e.target.value)}
                                                className="description-input"
                                            />
                                        ) : (
                                            <span className="description-value">
                                                {selectedLocationInfo.operatingHours || '24/7 Access Available'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="description-item">
                                        <span className="description-label">Machine Type:</span>
                                        {isEditMode ? (
                                            <InputText 
                                                value={selectedLocationInfo.machineType || 'Snack & Beverage Combo'}
                                                onChange={(e) => updateLocationInfo('machineType', e.target.value)}
                                                className="description-input"
                                            />
                                        ) : (
                                            <span className="description-value">
                                                {selectedLocationInfo.machineType || 'Snack & Beverage Combo'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="description-item">
                                        <span className="description-label">Payment Methods:</span>
                                        {isEditMode ? (
                                            <InputText 
                                                value={selectedLocationInfo.paymentMethods || 'Cash, Card, E-Wallet, QR Code'}
                                                onChange={(e) => updateLocationInfo('paymentMethods', e.target.value)}
                                                className="description-input"
                                            />
                                        ) : (
                                            <span className="description-value">
                                                {selectedLocationInfo.paymentMethods || 'Cash, Card, E-Wallet, QR Code'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="description-item">
                                        <span className="description-label">Last Maintenance:</span>
                                        {isEditMode ? (
                                            <InputText 
                                                value={selectedLocationInfo.lastMaintenance || '2 days ago'}
                                                onChange={(e) => updateLocationInfo('lastMaintenance', e.target.value)}
                                                className="description-input"
                                            />
                                        ) : (
                                            <span className="description-value">
                                                {selectedLocationInfo.lastMaintenance || '2 days ago'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="description-item">
                                        <span className="description-label">Status:</span>
                                        {isEditMode ? (
                                            <InputText 
                                                value={selectedLocationInfo.status || 'Active & Operational'}
                                                onChange={(e) => updateLocationInfo('status', e.target.value)}
                                                className="description-input"
                                            />
                                        ) : (
                                            <span className="description-value status-active">
                                                {selectedLocationInfo.status || 'Active & Operational'}
                                            </span>
                                        )}
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

            {/* Image Upload Dialog */}
            <Dialog
                header={`${selectedRowForImage?.images?.length > 0 ? 'Manage' : 'Add'} Images - ${selectedRowForImage?.code || ''}`}
                visible={imageUploadDialogVisible}
                style={{ width: '600px' }}
                modal
                onHide={() => setImageUploadDialogVisible(false)}
            >
                {selectedRowForImage && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Current Images Grid */}
                        {selectedRowForImage.images && selectedRowForImage.images.length > 0 && (
                            <div>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Current Images ({selectedRowForImage.images.length})</h4>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    {selectedRowForImage.images.map((img, idx) => {
                                        const imageObj = typeof img === 'string' ? { url: img, caption: '' } : img;
                                        return (
                                            <div 
                                                key={idx}
                                                style={{
                                                    position: 'relative',
                                                    borderRadius: '0.5rem',
                                                    overflow: 'hidden',
                                                    border: '2px solid var(--surface-border)',
                                                    backgroundColor: 'var(--surface-card)'
                                                }}
                                            >
                                                <img 
                                                    src={imageObj.url}
                                                    alt={imageObj.caption || `Image ${idx + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '120px',
                                                        objectFit: 'cover',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => {
                                                        const images = selectedRowForImage.images.map(i => 
                                                            typeof i === 'string' ? { url: i, caption: '' } : i
                                                        );
                                                        openLightbox(images, idx);
                                                    }}
                                                />
                                                {imageObj.caption && (
                                                    <div style={{
                                                        padding: '0.25rem 0.5rem',
                                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {imageObj.caption}
                                                    </div>
                                                )}
                                                {isEditMode && (
                                                    <Button
                                                        icon="pi pi-trash"
                                                        rounded
                                                        text
                                                        severity="danger"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '0.25rem',
                                                            right: '0.25rem',
                                                            width: '2rem',
                                                            height: '2rem',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                                        }}
                                                        onClick={() => deleteImageFromRow(selectedRowForImage, idx)}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Add New Image Form */}
                        {isEditMode && (
                            <div style={{ paddingTop: selectedRowForImage.images?.length > 0 ? '1rem' : '0', borderTop: selectedRowForImage.images?.length > 0 ? '1px solid var(--surface-border)' : 'none' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Add New Image</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                            Image URL <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <InputText
                                            value={imageUrlInput}
                                            onChange={(e) => setImageUrlInput(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            style={{ width: '100%' }}
                                        />
                                        <small style={{ color: 'var(--text-color-secondary)' }}>
                                            Enter a direct link to an image (jpg, png, gif, webp)
                                        </small>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                            Caption (Optional)
                                        </label>
                                        <InputText
                                            value={imageCaptionInput}
                                            onChange={(e) => setImageCaptionInput(e.target.value)}
                                            placeholder="Enter image caption..."
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <Button
                                            label="Cancel"
                                            icon="pi pi-times"
                                            onClick={() => {
                                                setImageUrlInput('');
                                                setImageCaptionInput('');
                                            }}
                                            className="p-button-text"
                                        />
                                        <Button
                                            label="Add Image"
                                            icon="pi pi-plus"
                                            onClick={addImageToRow}
                                            disabled={!imageUrlInput.trim()}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>

            {/* Lightbox for viewing images */}
            <div style={{ display: 'none' }}>
                <LightGallery
                    onInit={(detail) => {
                        lightGalleryRef.current = detail.instance;
                    }}
                    speed={500}
                    plugins={[lgThumbnail, lgZoom, lgFullscreen]}
                    dynamic={true}
                    dynamicEl={galleryItems}
                    closable={true}
                    showCloseIcon={true}
                    showMaximizeIcon={true}
                    counter={true}
                    download={false}
                    zoom={true}
                    thumbnail={true}
                    animateThumb={true}
                    zoomFromOrigin={false}
                    allowMediaOverlap={true}
                    toggleThumb={true}
                    thumbWidth={100}
                    thumbHeight={80}
                    thumbMargin={5}
                    exThumbImage="data-exthumbimage"
                    mode="lg-fade"
                    backdropDuration={300}
                />
            </div>

            {/* Power Mode Modal */}
            <PowerModeModal
                visible={powerModalVisible}
                onHide={() => {
                    setPowerModalVisible(false);
                    setSelectedPowerRow(null);
                }}
                rowData={selectedPowerRow}
                onSave={(newMode) => {
                    if (selectedPowerRow) {
                        // Update in modal products
                        const updatedProducts = modalProducts.map(p => 
                            p.id === selectedPowerRow.id ? { ...p, powerMode: newMode } : p
                        );
                        setModalProducts(updatedProducts);
                        setFilteredModalProducts(updatedProducts);
                        
                        // Mark as pre-saved
                        if (selectedRow) {
                            setModalPreSavedRows(prev => ({
                                ...prev,
                                [selectedRow.id]: {
                                    ...(prev[selectedRow.id] || {}),
                                    [selectedPowerRow.id]: true
                                }
                            }));
                        }
                    }
                }}
            />
        </div>
        </>
    );
}
