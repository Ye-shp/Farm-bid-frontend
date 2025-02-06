import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    Button,
    Box,
    useTheme
} from '@mui/material';

const AuctionForm = ({ showAuctionDialog, setShowAuctionDialog, newAuction, setNewAuction, products, handleCreateAuction }) => {
    const theme = useTheme();

    return (
        <Dialog
            open={showAuctionDialog}
            onClose={() => setShowAuctionDialog(false)}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                Create New Auction
            </DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Select Product</InputLabel>
                    <Select
                        value={newAuction.product}
                        onChange={(e) => setNewAuction({...newAuction, product: e.target.value })}
                    >
                        {products.map((product) => (
                            <MenuItem key={product._id} value={product._id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {product.imageUrl && (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            style={{ width: 40, height: 40, borderRadius: 4 }}
                                        />
                                    )}
                                    {product.title || product.customProduct}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    label="Starting Price"
                    type="number"
                    value={newAuction.startingPrice}
                    onChange={(e) => setNewAuction({...newAuction, startingPrice: e.target.value })}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">$/Lbs</InputAdornment>,
                    }}
                    sx={{ mt: 3 }}
                />
                <TextField
                    fullWidth
                    label="Auction Quantity"
                    type="number"
                    value={newAuction.auctionQuantity}
                    onChange={(e) => setNewAuction({...newAuction, auctionQuantity: e.target.value })}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">Lbs</InputAdornment>,
                    }}
                    sx={{ mt: 3 }}
                />

                <TextField
                    fullWidth
                    label="Auction End Time"
                    type="datetime-local"
                    value={newAuction.endTime}
                    onChange={(e) => setNewAuction({...newAuction, endTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                        min: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
                    }}
                    sx={{ mt: 3 }}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={() => setShowAuctionDialog(false)}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleCreateAuction}
                    disabled={!newAuction.product ||!newAuction.startingPrice ||!newAuction.endTime}
                >
                    Launch Auction
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AuctionForm;