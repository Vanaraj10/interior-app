import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PDF_ROW_GENERATORS } from "../components/pdfGenerators";
import { COLORS } from "../styles/colors";

const { width, height } = Dimensions.get("window");

const INTERIOR_TYPES = [
  {
    key: "curtains",
    label: "CURTAINS - CURTAIN COST",
    generator: PDF_ROW_GENERATORS.curtains,
    columns: [
      "S.No",
      "Room",
      "Width",
      "Height",
      "Part",
      "Stitching Model",
      "Main Metre",
      "Cloth Cost",
      "Stitching Cost",
      "Lining Metre",
      "Lining Cost",
      "Total Curtain Cost",
    ],
    hasRodCost: true, // Flag to indicate this type needs rod cost table
  },
  {
    key: "mosquito-nets",
    label: "MOSQUITO NETS",
    generator: PDF_ROW_GENERATORS["mosquito-nets"],
    columns: [
      "S.No",
      "Room Label",
      "Width (in/ft)",
      "Height (in/ft)",
      "Material Type",
      "Rate/Sqft (₹)",
      "Total Sqft",
      "Material Cost",
      "Description",
    ],
  },
  {
    key: "wallpapers",
    label: "WALLPAPERS",
    generator: PDF_ROW_GENERATORS.wallpapers,
    columns: [
      "S.No",
      "Room Label",
      "Width (in)",
      "Height (in)",
      "Area (sqft)",
      "Rolls",
      "Material Cost",
      "Implementation Cost",
      "Total Cost",
    ],
  },
  {
    key: "blinds",
    label: "BLINDS",
    generator: PDF_ROW_GENERATORS.blinds,
    columns: [
      "S.No",
      "Room Label",
      "Height (in)",
      "Width (in)",
      "Total Sqft",
      "Blinds Cost",
      "Type",
      "Parts",
      "Cloth Required",
      "Cloth Cost",
      "Stitching Cost",
      "Total Cost",
    ],
  },
  {
    key: "flooring",
    label: "FLOORING",
    generator: PDF_ROW_GENERATORS.flooring,
    columns: [
      "S.No",
      "Room Label",
      "Length (ft)",
      "Width (ft)",
      "Area (sqft)",
      "Material Cost",
      "Labor Cost",
      "Total Cost",
    ],
  },
];

export default function PDFPreview() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const loadProject = useCallback(async () => {
    try {
      const projectsData = await AsyncStorage.getItem("projects");
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        const currentProject = projects.find((p) => p.id === id);
        if (currentProject) {
          // Ensure measurements have roomName and roomId for curtains
          if (currentProject.measurements && currentProject.curtainRooms) {
            currentProject.measurements = currentProject.measurements.map(m => {
              // Only process curtain measurements
              if (m.interiorType === "curtains" && m.roomId) {
                const room = currentProject.curtainRooms.find(r => r.id === m.roomId);
                if (room) {
                  return {
                    ...m,
                    roomName: room.name
                  };
                }
              }
              return m;
            });
          }
          setProject(currentProject);
        } else {
          Alert.alert("Error", "Project not found");
          router.back();
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const generatePDFContent = () => {
    if (!project) return "";
    let htmlSections = "";
    INTERIOR_TYPES.forEach((type) => {
      let measurements = [];
      
      // For curtains, we need to collect all measurements including those in rooms
      if (type.key === "curtains") {
        // Get regular measurements (backward compatibility)
        const regularMeasurements = project.measurements?.filter(m => m.interiorType === "curtains") || [];
        
        // Get measurements from curtain rooms
        const roomMeasurements = [];
        if (project.curtainRooms && Array.isArray(project.curtainRooms)) {
          project.curtainRooms.forEach(room => {
            if (room.measurements && Array.isArray(room.measurements)) {
              const measurementsWithRoomInfo = room.measurements.map(m => ({
                ...m,
                roomId: room.id,
                roomName: room.name,
                interiorType: "curtains"
              }));
              roomMeasurements.push(...measurementsWithRoomInfo);
            }
          });
        }
        
        // Combine all measurements
        measurements = [...regularMeasurements, ...roomMeasurements];
      } else {
        // For other interior types, use the standard filtering
        measurements = project.measurements?.filter(m => m.interiorType === type.key) || [];
      }
      
      if (measurements.length > 0) {
        htmlSections += `
          <div class="section-title">${type.label}</div>
          <table>
            <thead>
              <tr>${type.columns.map((col) => `<th>${col}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${type.generator(measurements, formatCurrency)}
              ${
                type.generator.totals
                  ? type.generator.totals(measurements, formatCurrency)
                  : ""
              }
            </tbody>
          </table>
        `;
        // Add Rod Cost table for curtains
        if (type.key === "curtains" && type.hasRodCost && measurements.length > 0) {
          htmlSections += `
            <div class="section-title" style="margin-top: 30px;">ROD COST</div>
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Curtain Wall Bracket</th>
                  <th>Rod Feet</th>
                  <th>Clamp Cost</th>
                  <th>Doom Cost</th>
                  <th>Wall Bracket Cost</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                ${
                  PDF_ROW_GENERATORS.curtains.generateRodCostRows
                    ? PDF_ROW_GENERATORS.curtains.generateRodCostRows(
                        measurements,
                        formatCurrency
                      )
                    : ""
                }
              </tbody>
            </table>
          `;
        }
      }
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quotation - ${project.clientName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.4; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 20px;
          }
          .company-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #3B82F6;
            margin-bottom: 5px;
          }
          .company-subtitle { 
            font-size: 14px; 
            color: #666;
          }
          .client-info { 
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px;
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #3B82F6;
            margin: 25px 0 15px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
            font-size: 12px;
          }
          th { 
            background-color: #3B82F6; 
            color: white; 
            padding: 10px 8px; 
            text-align: center;
            font-weight: bold;
            border: 1px solid #ddd;
          }
          td { 
            padding: 8px; 
            border: 1px solid #ddd;
          }
          .cost-summary { 
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          .cost-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 10px;
            padding: 5px 0;
          }
          .grand-total { 
            border-top: 2px solid #3B82F6;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #3B82F6;
          }
          .footer { 
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
            font-size: 12px;
            color: #666;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">BENTLEI CURTAIN</div>
          <div class="company-subtitle">Designed With Luxary & Comfort</div>
        </div>

        <div class="client-info">
          <div class="info-row">
            <span><strong>Client Name:</strong> ${project.clientName}</span>
            <span><strong>Date:</strong> ${new Date().toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span><strong>Phone:</strong> ${project.phone}</span>
            <span><strong>Project ID:</strong> ${project.id}</span>
          </div>
          <div class="info-row">
            <span><strong>Address:</strong> ${project.address}</span>
          </div>
        </div>        ${htmlSections}

        ${
          // Check if we have any curtain measurements (either in project.measurements or in rooms)
          (() => {
            // Collect all curtain measurements including those in rooms
            let allCurtainMeasurements = [];
            
            // Get regular measurements (backward compatibility)
            const regularMeasurements = project.measurements?.filter(
              m => m.interiorType === "curtains" || m.curtainType || m.stitchingModel
            ) || [];
            allCurtainMeasurements = [...regularMeasurements];
            
            // Get measurements from curtain rooms
            if (project.curtainRooms && Array.isArray(project.curtainRooms)) {
              project.curtainRooms.forEach(room => {
                if (room.measurements && Array.isArray(room.measurements)) {
                  const roomMeasurements = room.measurements.map(m => ({
                    ...m,
                    roomId: room.id,
                    roomName: room.name,
                    interiorType: "curtains"
                  }));
                  allCurtainMeasurements.push(...roomMeasurements);
                }
              });
            }
            
            // Generate cost summary if we have curtain measurements
            if (allCurtainMeasurements.length > 0 && PDF_ROW_GENERATORS.curtains.generateTotalCostSummary) {
              return PDF_ROW_GENERATORS.curtains.generateTotalCostSummary(
                allCurtainMeasurements,
                formatCurrency
              );
            } else {
              // Default cost summary if we don't have the generator
              return '<div class="cost-summary"><h3 style="margin-top: 0; color: #3B82F6;">COST SUMMARY</h3>';
            }
          })()
        }
              ${
                project.netTotal > 0
                  ? `<div class="cost-row"><span>Mosquito Nets Subtotal:</span><span>${formatCurrency(
                      project.netTotal
                    )}</span></div>`
                  : ""
              }
              ${
                project.wallpaperTotal > 0
                  ? `<div class="cost-row"><span>Wallpapers Subtotal:</span><span>${formatCurrency(
                      project.wallpaperTotal
                    )}</span></div>`
                  : ""
              }
              ${
                project.blindsTotal > 0
                  ? `<div class="cost-row"><span>Blinds Subtotal:</span><span>${formatCurrency(
                      project.blindsTotal
                    )}</span></div>`
                  : ""
              }
              ${
                project.rodCost > 0
                  ? `<div class="cost-row"><span>Rod Installation:</span><span>${formatCurrency(
                      project.rodCost
                    )}</span></div>`
                  : ""
              }
              <div class="cost-row grand-total">
                <span>GRAND TOTAL:</span>
                <span>${formatCurrency(project.grandTotal || 0)}</span>
              </div>
            </div>
        </body>
      </html>
    `;
  };

  const generateAndSharePDF = async () => {
    if (!project) return;
    setIsGenerating(true);
    try {
      const htmlContent = generatePDFContent();
      if (Platform.OS === "web") {
        try {
          // Use our improved PDF generator for web
          const { generateWebPDF } = await import('./improved-pdf');
          await generateWebPDF(htmlContent, `Quotation-${project.clientName}.pdf`);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
          console.error("Error with improved PDF generation:", err);
          Alert.alert("PDF Generation Failed", "Please try again or use a different browser.");
        } finally {
          setIsGenerating(false);
        }
        return;
      }
      
      // Native platforms use expo-print
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Quotation - ${project.clientName}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Success", "PDF generated successfully!");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const printPDF = async () => {
    if (!project || isPrinting) return;
    setIsPrinting(true);
    try {
      const htmlContent = generatePDFContent();
      if (Platform.OS === "web") {
        // Use our improved PDF printing for web
        try {
          // Import the improved PDF module dynamically to avoid issues on non-web platforms
          const { printWebPDF } = await import('./improved-pdf');
          await printWebPDF(htmlContent);
          setIsPrinting(false);
        } catch (err) {
          console.error("Error with improved PDF print:", err);
          // Fallback to direct print
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
            throw new Error('Popup blocked. Please allow popups for this site.');
          }
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Print - ${project.clientName}</title>
                <style>
                  @media print {
                    body { margin: 0; padding: 0; }
                    @page { size: A4; margin: 10mm; }
                  }
                </style>
              </head>
              <body>
                ${htmlContent}
                <script>
                  window.onload = function() {
                    setTimeout(() => { window.print(); }, 500);
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
          setIsPrinting(false);
        }
        return;
      }
      
      // Native platforms use expo-print
      await Print.printAsync({
        html: htmlContent,
      });
      setIsPrinting(false);
    } catch (error) {
      setIsPrinting(false);
      console.error("Error printing PDF:", error);
      Alert.alert("Error", "Failed to print PDF");
    }
  };
  if (!project) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
          style={styles.loadingContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Loading Project...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.patternCircle,
                {
                  top: Math.random() * height,
                  left: Math.random() * width,
                  opacity: 0.03 + Math.random() * 0.07,
                },
              ]}
            />
          ))}
        </View>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>PDF Preview</Text>
              <Text style={styles.headerSubtitle}>{project.clientName}</Text>
            </View>
          </View>
        </View>{" "}
        {/* Preview Content */}
        <ScrollView style={styles.scrollView}>
          <View style={styles.previewCard}>
            {/* Short PDF summary: Grand Total and breakdown */}
            <Text style={styles.sectionTitle}>Quotation Summary</Text>
            <View style={styles.costSummary}>
              <Text style={styles.costSummaryTitle}>Cost Breakdown</Text>
              {project.curtainTotal > 0 && (
                <View style={styles.costRow}>
                  <Text>Curtains:</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(project.curtainTotal)}
                  </Text>
                </View>
              )}
              {project.netTotal > 0 && (
                <View style={styles.costRow}>
                  <Text>Mosquito Nets:</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(project.netTotal)}
                  </Text>
                </View>
              )}
              {project.wallpaperTotal > 0 && (
                <View style={styles.costRow}>
                  <Text>Wallpapers:</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(project.wallpaperTotal)}
                  </Text>
                </View>
              )}
              {project.blindsTotal > 0 && (
                <View style={styles.costRow}>
                  <Text>Blinds:</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(project.blindsTotal)}
                  </Text>
                </View>
              )}
              {project.flooringTotal > 0 && (
                <View style={styles.costRow}>
                  <Text>Flooring:</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(project.flooringTotal)}
                  </Text>
                </View>
              )}
              {project.rodCost > 0 && (
                <View style={styles.costRow}>
                  <Text>Rod Installation:</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(project.rodCost)}
                  </Text>
                </View>
              )}
              <View style={styles.grandTotalRow}>
                <View style={styles.totalRowContent}>
                  <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
                  <Text style={styles.grandTotalValue}>
                    {formatCurrency(project.grandTotal || 0)}
                  </Text>
                </View>
              </View>
            </View>
            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 24,
                gap: 12,
              }}
            >
              <TouchableOpacity
                style={[styles.button, { flex: 1, minWidth: 0 }]}
                onPress={printPDF}
              >
                <Ionicons name="print" size={20} color="white" />
                <Text style={styles.buttonText}>Print</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 1, minWidth: 0 }]}
                onPress={generateAndSharePDF}
              >
                <Ionicons name="share" size={20} color="white" />
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 0,
                gap: 12,
              }}
            >
              <TouchableOpacity
                style={[styles.button, { flex: 1, minWidth: 0 }]}
                onPress={async () => {
                  // Upload logic as before
                  try {
                    const token = await AsyncStorage.getItem("token");
                    if (!token) {
                      Alert.alert("Not Authenticated", "Please login first.");
                      router.replace("/login");
                      return;
                    }
                    const htmlContent = generatePDFContent();
                    const cleanedHtmlContent = htmlContent
                      .replace(/\\/g, "")
                      .replace(/>\s+</g, "><")
                      .replace(/[\n\r\t]+/g, " ")
                      .replace(/\s{2,}/g, " ")
                      .replace(/\"/g, '"')
                      .trim();
                    const response = await fetch(
                      "https://interior-app-production.up.railway.app/api/worker/projects",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          clientName: project.clientName,
                          phone: project.phone,
                          address: project.address,
                          html: cleanedHtmlContent,
                        }),
                      }
                    );
                    if (response.ok) {
                      setShowSuccess(true);
                      setTimeout(() => {
                        setShowSuccess(false);
                        router.replace("/");
                      }, 4000);
                    } else if (response.status === 401) {
                      Alert.alert("Session Expired", "Please login again.");
                      router.replace("/login");
                    } else {
                      const data = await response.json();
                      Alert.alert(
                        "Upload Failed",
                        data.error || "Failed to upload project"
                      );
                    }
                  } catch (_error) {
                    Alert.alert("Error", "Could not upload project");
                  }
                }}
              >
                <Ionicons name="cloud-upload" size={20} color="white" />
                <Text style={styles.buttonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        {showSuccess && (
          <View style={styles.successOverlay}>
            <View style={styles.successModal}>
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.1)", "rgba(34, 197, 94, 0.05)"]}
                style={styles.successModalGradient}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color="#22c55e"
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.successText}>
                  Quotation uploaded successfully!
                </Text>
                <Text style={styles.successSubtext}>
                  Redirecting to home...
                </Text>
              </LinearGradient>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    padding: 40,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderTopColor: "white",
    marginBottom: 16,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  previewCard: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    padding: 24,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  costSummary: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.1)",
    marginBottom: 8,
  },
  costSummaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.1)",
  },
  costValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.success,
  },
  grandTotalRow: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalRowContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    flexDirection: "row",
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  successModal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    marginHorizontal: 40,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  successText: {
    color: "#15803d",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});
