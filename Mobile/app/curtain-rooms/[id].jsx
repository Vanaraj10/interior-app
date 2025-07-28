import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  TextInput,
  Dimensions,
  SafeAreaView,
  Modal
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../styles/colors";

const { width, height } = Dimensions.get("window");

export default function CurtainRooms() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  // Load project and rooms data
  const loadProject = useCallback(async () => {
    try {
      const projectsData = await AsyncStorage.getItem("projects");
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        const currentProject = projects.find((p) => p.id === id);
        
        if (currentProject) {
          setProject(currentProject);
          
          // Initialize or load curtain rooms
          if (!currentProject.curtainRooms) {
            currentProject.curtainRooms = [];
          }
          
          setRooms(currentProject.curtainRooms);
        } else {
          Alert.alert("Error", "Project not found");
          router.back();
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadProject();
    }, [loadProject])
  );

  // Save rooms data
  const saveRooms = async (updatedRooms) => {
    try {
      const projectsData = await AsyncStorage.getItem("projects");
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        const projectIndex = projects.findIndex((p) => p.id === id);
        
        if (projectIndex !== -1) {
          // Update rooms in the project
          projects[projectIndex].curtainRooms = updatedRooms;
          
          // Save back to storage
          await AsyncStorage.setItem("projects", JSON.stringify(projects));
          setRooms(updatedRooms);
        }
      }
    } catch (error) {
      console.error("Error saving rooms:", error);
    }
  };

  // Add new room
  const addRoom = () => {
    if (!newRoomName.trim()) {
      Alert.alert("Error", "Room name cannot be empty");
      return;
    }

    // Check if room name already exists
    const roomExists = rooms.some(
      (room) => room.name.toLowerCase() === newRoomName.toLowerCase()
    );

    if (roomExists) {
      Alert.alert("Error", "A room with this name already exists");
      return;
    }

    const newRoom = {
      id: Date.now().toString(),
      name: newRoomName,
      measurements: []
    };

    const updatedRooms = [...rooms, newRoom];
    saveRooms(updatedRooms);
    setNewRoomName("");
    setModalVisible(false);
  };

  // Delete room
  const deleteRoom = (roomId) => {
    Alert.alert(
      "Delete Room",
      "Are you sure you want to delete this room? All measurements in this room will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedRooms = rooms.filter((room) => room.id !== roomId);
            saveRooms(updatedRooms);
          },
        },
      ]
    );
  };

  // Navigate to measurements page for a specific room
  const goToMeasurements = (roomId, roomName) => {
    router.push({
      pathname: "/interior-measurements/[type]",
      params: { id, type: "curtains", roomId, roomName },
    });
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
            <Text style={styles.loadingText}>Loading Rooms...</Text>
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
                  opacity: 0.05 + Math.random() * 0.1,
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
              <Text style={styles.headerTitle}>Curtain Rooms</Text>
              <Text style={styles.headerSubtitle}>
                {project.clientName}'s Project
              </Text>
            </View>
          </View>
        </View>

        {/* Rooms List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {rooms.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="home-outline"
                  size={64}
                  color="rgba(255, 255, 255, 0.7)"
                />
              </View>
              <Text style={styles.emptyTitle}>No Rooms Added</Text>
              <Text style={styles.emptySubtitle}>
                Add rooms to organize curtain measurements
              </Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => setModalVisible(true)}
              >
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.2)",
                    "rgba(255, 255, 255, 0.1)",
                  ]}
                  style={styles.createFirstGradient}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text style={styles.createFirstText}>Add Room</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.roomsContainer}>
              {rooms.map((room) => (
                <View key={room.id} style={styles.roomCard}>
                  <LinearGradient
                    colors={[
                      "rgba(255, 255, 255, 0.98)",
                      "rgba(255, 255, 255, 0.95)",
                    ]}
                    style={styles.cardGradient}
                  >
                    <View style={styles.roomHeader}>
                      <View style={styles.roomNameContainer}>
                        <Ionicons name="home" size={22} color={COLORS.primary} />
                        <Text style={styles.roomName}>{room.name}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteRoom(room.id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={COLORS.error}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.roomInfo}>
                      <Text style={styles.measurementCount}>
                        {room.measurements ? room.measurements.length : 0}{" "}
                        measurements
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => goToMeasurements(room.id, room.name)}
                    >
                      <Text style={styles.viewButtonText}>
                        View Measurements
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="white"
                      />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Add Room FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.95)",
              "rgba(255, 255, 255, 0.85)",
            ]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={COLORS.primary} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Add Room Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Room</Text>
              <TextInput
                style={styles.input}
                placeholder="Room Name"
                placeholderTextColor="#888"
                value={newRoomName}
                onChangeText={setNewRoomName}
              />
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setNewRoomName("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.addButton]}
                  onPress={addRoom}
                >
                  <Text style={styles.addButtonText}>Add Room</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
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
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  emptyTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptySubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  createFirstButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createFirstGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  createFirstText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  roomsContainer: {
    paddingVertical: 16,
    gap: 16,
  },
  roomCard: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 20,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  roomNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  roomName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  deleteButton: {
    padding: 6,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
  },
  roomInfo: {
    marginBottom: 16,
  },
  measurementCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  viewButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    overflow: "hidden",
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f1f1",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderLeftColor: "white",
    marginBottom: 12,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});
