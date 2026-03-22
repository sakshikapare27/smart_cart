import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const qrcodeRegionId = "qr-reader";

interface CartItem {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
}

interface ShoppingCartProps {
    signOut?: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ signOut }) => {
    const [scanning, setScanning] = useState(false);
    const [items, setItems] = useState<CartItem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [cartNumber, setCartNumber] = useState<string | null>(null);

    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenCamera = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
        }
    };

    const handleAddItem = () => setShowModal(true);
    const handleCancel = () => {
        setPreviewImage(null);
        setShowModal(false);
    };

    const handleConfirmAdd = () => {
        const newItem: CartItem = {
            id: Date.now(),
            name: `Photo Item ${items.length + 1}`,
            price: Math.floor(Math.random() * 100) + 1,
            imageUrl: previewImage || undefined,
        };
        setItems(prev => [...prev, newItem]);
        setPreviewImage(null);
        setShowModal(false);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const stopScanner = () => {
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current
                .stop()
                .then(() => {
                    html5QrCodeRef.current?.clear();
                    html5QrCodeRef.current = null;
                    setScanning(false);
                })
                .catch(err => {
                    console.error("Error stopping scanner:", err);
                    setScanning(false);
                });
        } else {
            setScanning(false);
        }
    };


    const startScanning = () => {
        setScanning(true);
    };

    useEffect(() => {
    if (!scanning) return;

    const timeoutId = setTimeout(() => {
        const qrElement = document.getElementById(qrcodeRegionId);
        if (!qrElement) {
            console.warn("QR reader element not found yet.");
            return;
        }

        const qrCodeScanner = new Html5Qrcode(qrcodeRegionId);
        html5QrCodeRef.current = qrCodeScanner;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E
            ],
            videoConstraints: {
                facingMode: "environment"
            }
        };

        qrCodeScanner
            .start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    console.log("Scanned:", decodedText);
                    setCartNumber(decodedText);
                    stopScanner();
                },
                (errorMessage) => {
                    console.warn("Scan error:", errorMessage);
                }
            )
            .catch((err) => {
                console.error("Failed to start scanner:", err);
                setScanning(false);
            });

    }, 300); // wait 300ms for the DOM to catch up

    return () => {
        clearTimeout(timeoutId);
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current
                .stop()
                .then(() => html5QrCodeRef.current?.clear())
                .catch(err => console.error("Cleanup error", err))
                .finally(() => {
                    html5QrCodeRef.current = null;
                });
        }
    };
}, [scanning]);



    const total = items.reduce((sum, item) => sum + item.price, 0);

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.topRow}>
            <img
                src="/smartcart-logo.svg"
                alt="SmartCart Logo"
                style={styles.logo}
            />
            <button onClick={signOut} style={styles.logoutButton}>
                Logout
            </button>
        </div>

            <div style={styles.card}>
                <h2 style={styles.heading}>
                    Shopping Cart {cartNumber && <> - Cart #: <strong>{cartNumber}</strong></>}
                </h2>

                <div style={styles.buttonRow}>
                    <button onClick={startScanning} style={{ ...styles.button, marginRight: 10 }}>
                        Scan Cart QR
                    </button>
                    <button onClick={handleAddItem} style={styles.button}>
                        Add Item
                    </button>
                </div>

                {scanning && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h3>Scan Cart QR Code</h3>
                            <div id={qrcodeRegionId} style={{ width: 300, height: 300, margin: '0 auto' }} />
                            <button
                                onClick={stopScanner}
                                style={{ ...styles.removeButton, marginTop: 20 }}
                            >
                                Cancel Scan
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {items.length === 0 ? (
                <p style={styles.emptyText}>Your cart is empty.</p>
            ) : (
                <ul style={styles.itemList}>
                    {items.map(item => (
                        <li key={item.id} style={styles.itemRow}>
                            <span>{item.name}</span>
                            <div style={styles.priceGroup}>
                                <span>₹ {item.price.toFixed(2)}</span>
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    style={styles.removeButton}
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div style={styles.totalRow}>
                <strong>Total:</strong>
                <span>₹ {total.toFixed(2)}</span>
            </div>

            {/* Hidden file input for camera */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Modal for adding item */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3>Capture Item Photo</h3>
                        <button onClick={handleOpenCamera} style={styles.button}>
                            Open Camera
                        </button>

                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Preview"
                                style={{ marginTop: 10, width: '100%', borderRadius: 8 }}
                            />
                        )}

                        <div style={styles.modalButtons}>
                            <button
                                onClick={handleConfirmAdd}
                                style={styles.button}
                                disabled={!previewImage}
                            >
                                Add
                            </button>
                            <button onClick={handleCancel} style={styles.removeButton}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    pageWrapper: {
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#f5f5f5',
        color: '#000',
        padding: '20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowX: 'hidden',
    },
    topRow: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    logo: {
        width: '120px',
        height: 'auto',
    },
    logoutButton: {
        padding: '10px 14px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer',
    },
    card: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
    },
    heading: {
        fontSize: '20px',
        marginBottom: '16px',
    },
    buttonRow: {
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'flex-start',
    },
    button: {
        padding: '10px 16px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
    },
    itemList: {
        listStyle: 'none',
        padding: 0,
        marginBottom: '20px',
    },
    itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #eee',
        fontSize: '16px',
    },
    priceGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    removeButton: {
        padding: '6px 10px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    emptyText: {
        fontStyle: 'italic',
        color: '#777',
        textAlign: 'center',
        marginBottom: '20px',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    modal: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '400px',
        boxSizing: 'border-box',
        textAlign: 'center',
    },
    modalButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '16px',
    },
};

export default ShoppingCart;
