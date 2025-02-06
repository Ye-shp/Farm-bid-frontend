import React from 'react';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, PhotoCamera, Close as CloseIcon } from '@mui/icons-material';

const ProductForm = ({
  activeStep,
  setActiveStep,
  newProduct,
  setNewProduct,
  productCategories,
  handleImageChange,
  handleCreateProduct,
  loading,
}) => {
  return (
    <Paper elevation={0} sx={{ p: 4, mb: 6, borderRadius: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
        <Step>
          <StepLabel>Product Details</StepLabel>
        </Step>
        <Step>
          <StepLabel>Quality Assurance</StepLabel>
        </Step>
        <Step>
          <StepLabel>Confirmation</StepLabel>
        </Step>
      </Stepper>

      <form onSubmit={handleCreateProduct}>
        {activeStep === 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Product Category</InputLabel>
                <Select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({
                    ...newProduct,
                      category: e.target.value,
                      subcategory: '',
                      customCategory: '',
                      customSubcategory: '',
                    })
                  }
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {Object.keys(productCategories).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">Custom Category</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Quantity (lbs)"
                type="number"
                value={newProduct.totalQuantity}
                onChange={(e) =>
                  setNewProduct({
                  ...newProduct,
                    totalQuantity: e.target.value,
                  })
                }
                required
              />
            </Grid>

            {newProduct.category === 'custom' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Custom Category"
                  value={newProduct.customCategory}
                  onChange={(e) =>
                    setNewProduct({
                    ...newProduct,
                      customCategory: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
            )}

            {newProduct.category && newProduct.category!== 'custom' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Subcategory</InputLabel>
                  <Select
                    value={newProduct.subcategory}
                    onChange={(e) =>
                      setNewProduct({
                      ...newProduct,
                        subcategory: e.target.value,
                        customSubcategory: '',
                      })
                    }
                  >
                    <MenuItem value="">Select Subcategory</MenuItem>
                    {productCategories[newProduct.category]?.map((subcategory) => (
                      <MenuItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom">Custom Subcategory</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {newProduct.subcategory === 'custom' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Custom Subcategory"
                  value={newProduct.customSubcategory}
                  onChange={(e) =>
                    setNewProduct({
                    ...newProduct,
                      customSubcategory: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({
                  ...newProduct,
                    description: e.target.value,
                  })
                }
                required
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <ImageUploadArea>
                <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                {newProduct.previewUrl? (
                  <Box textAlign="center">
                    <img
                      src={newProduct.previewUrl}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
                    />
                    <Button variant="text" color="primary" startIcon={<PhotoCamera />} sx={{ mt: 2 }}>
                      Change Image
                    </Button>
                  </Box>
                ): (
                  <Box textAlign="center">
                    <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      Upload high-quality product photos
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Recommended size: 1200x800px
                    </Typography>
                  </Box>
                )}
              </ImageUploadArea>
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newProduct.certifications.organic.isCertified}
                    onChange={(e) =>
                      setNewProduct({
                      ...newProduct,
                        certifications: {
                        ...newProduct.certifications,
                          organic: {
                          ...newProduct.certifications.organic,
                            isCertified: e.target.checked,
                          },
                        },
                      })
                    }
                  />
                }
                label="Organic Certified"
              />
            </Grid>

            {newProduct.certifications.organic.isCertified && (
              <Grid item xs={12} container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Certifying Body"
                    value={newProduct.certifications.organic.certifyingBody}
                    onChange={(e) =>
                      setNewProduct({
                      ...newProduct,
                        certifications: {
                        ...newProduct.certifications,
                          organic: {
                          ...newProduct.certifications.organic,
                            certifyingBody: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Certification Number"
                    value={newProduct.certifications.organic.certificationNumber}
                    onChange={(e) =>
                      setNewProduct({
                      ...newProduct,
                        certifications: {
                        ...newProduct.certifications,
                          organic: {
                          ...newProduct.certifications.organic,
                            certificationNumber: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Grid>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Food Safety Certifications
              </Typography>
              {newProduct.certifications.foodSafety.map((cert, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <InputLabel>Certification Type</InputLabel>
                      <Select
                        value={cert.certificationType}
                        onChange={(e) => {
                          const updated = [...newProduct.certifications.foodSafety];
                          updated[index].certificationType = e.target.value;
                          setNewProduct({
                          ...newProduct,
                            certifications: {
                            ...newProduct.certifications,
                              foodSafety: updated,
                            },
                          });
                        }}
                      >
                        <MenuItem value="GAP">GAP</MenuItem>
                        <MenuItem value="HACCP">HACCP</MenuItem>
                        <MenuItem value="FSMA">FSMA</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {cert.certificationType === 'Other' && (
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Other Certification"
                        value={cert.otherCertification}
                        onChange={(e) => {
                          const updated = [...newProduct.certifications.foodSafety];
                          updated[index].otherCertification = e.target.value;
                          setNewProduct({
                          ...newProduct,
                            certifications: {
                            ...newProduct.certifications,
                              foodSafety: updated,
                            },
                          });
                        }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      label="Audit Score"
                      type="number"
                      value={cert.auditScore}
                      onChange={(e) => {
                        const updated = [...newProduct.certifications.foodSafety];
                        updated[index].auditScore = e.target.value;
                        setNewProduct({
                        ...newProduct,
                          certifications: {
                          ...newProduct.certifications,
                            foodSafety: updated,
                          },
                        });
                      }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      onClick={() =>
                        setNewProduct({
                        ...newProduct,
                          certifications: {
                          ...newProduct.certifications,
                            foodSafety: newProduct.certifications.foodSafety.filter((_, i) => i!== index),
                          },
                        })
                      }
                    >
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  setNewProduct({
                  ...newProduct,
                    certifications: {
                    ...newProduct.certifications,
                      foodSafety: [
                      ...newProduct.certifications.foodSafety,
                        {
                          certificationType: 'GAP',
                          otherCertification: '',
                          auditScore: '',
                          auditDate: '',
                          certifyingBody: '',
                        },
                      ],
                    },
                  })
                }
              >
                Add Food Safety Certification
              </Button>
            </Grid>
          </Grid>
        )}

        {activeStep === 2 && (
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Final Confirmation
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'error.main',
                  borderRadius: 2,
                  backgroundColor: 'error.light',
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontFamily: 'monospace',
                    maxHeight: 200,
                    overflowY: 'auto',
                    mb: 2,
                  }}
                >
                  <strong>Agricultural Product Liability Acknowledgement</strong>
                  <br />
                  <br />
                  By checking this box, I hereby affirm that:
                  <ul>
                    <li>All product information provided is accurate to the best of my knowledge</li>
                    <li>I possess valid documentation for all claimed certifications</li>
                    <li>Production practices disclosed meet current agricultural safety standards</li>
                    <li>I bear full responsibility for any misrepresentation of product quality</li>
                    <li>The platform holds no liability for product claims or buyer disputes</li>
                  </ul>
                  Violations may result in account suspension and legal action.
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newProduct.liabilityAccepted}
                      onChange={(e) =>
                        setNewProduct({
                        ...newProduct,
                          liabilityAccepted: e.target.checked,
                        })
                      }
                      color="error"
                    />
                  }
                  label={
                    <Typography variant="body2" color="error">
                      I accept full liability for the accuracy of this product listing
                    </Typography>
                  }
                  sx={{ mt: 2 }}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>
            Back
          </Button>

          {activeStep < 2? (
            <Button variant="contained" onClick={() => setActiveStep((prev) => prev + 1)}>
              Next
            </Button>
          ): (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading? 'Submitting...': 'Publish Product'}
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default ProductForm;