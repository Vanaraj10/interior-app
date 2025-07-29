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
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { INTERIOR_SCHEMAS, calculateRods } from "../components/interiorSchemas";
import { COLORS } from "../styles/colors";

const { width, height } = Dimensions.get("window");

// TableHeader component
const TableHeader = ({ type }) => {
  return (
    <>
      {type === "flooring" ? (
        <>
          <View style={[styles.tableHeaderCell, styles.snoColumn]}>
            <Text style={styles.headerText}>S.No</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.roomColumn]}>
            <Text style={styles.headerText}>Room</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.dimensionColumn]}>
            <Text style={styles.headerText}>Height (in)</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.dimensionColumn]}>
            <Text style={styles.headerText}>Width (in)</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Total Sqft</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Material Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Laying Charge</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.totalColumn]}>
            <Text style={styles.headerText}>Total</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.actionColumn]}>
            <Text style={styles.headerText}>Actions</Text>
          </View>
        </>
      ) : type === "curtains" ? (
        <>
          <View style={[styles.tableHeaderCell, styles.snoColumn]}>
            <Text style={styles.headerText}>S.No</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.roomColumn]}>
            <Text style={styles.headerText}>Room</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.dimensionColumn]}>
            <Text style={styles.headerText}>Width</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.dimensionColumn]}>
            <Text style={styles.headerText}>Height</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.smallColumn]}>
            <Text style={styles.headerText}>Part</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.typeColumn]}>
            <Text style={styles.headerText}>Stitching Model</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Main Metre</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Cloth Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Stitching Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Lining Metre</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Lining Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.totalColumn]}>
            <Text style={styles.headerText}>Total Curtain Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.actionColumn]}>
            <Text style={styles.headerText}>Actions</Text>
          </View>
        </>
      ) : type === "blinds" ? (
        <>
          <View style={[styles.tableHeaderCell, styles.snoColumn]}>
            <Text style={styles.headerText}>S.No</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.roomColumn]}>
            <Text style={styles.headerText}>Room</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.dimensionColumn]}>
            <Text style={styles.headerText}>Height (in)</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.dimensionColumn]}>
            <Text style={styles.headerText}>Width (in)</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Total Sqft</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Blinds Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.typeColumn]}>
            <Text style={styles.headerText}>Blind Type</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.smallColumn]}>
            <Text style={styles.headerText}>Parts</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Cloth Required</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Cloth Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Stitching Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.totalColumn]}>
            <Text style={styles.headerText}>Total</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.actionColumn]}>
            <Text style={styles.headerText}>Actions</Text>
          </View>
        </>
      ) : type === "mosquito-nets" ? (
        <>
          <View style={[styles.tableHeaderCell, styles.snoColumn]}>
            <Text style={styles.headerText}>S.No</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.roomColumn]}>
            <Text style={styles.headerText}>Room</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.dimensionColumn]}>
            <Text style={styles.headerText}>Width (in/ft)</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.dimensionColumn]}>
            <Text style={styles.headerText}>Height (in/ft)</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.typeColumn]}>
            <Text style={styles.headerText}>Material Type</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.costColumn]}>
            <Text style={styles.headerText}>Rate/Sqft</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Total Sqft</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Material Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Description</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.actionColumn]}>
            <Text style={styles.headerText}>Actions</Text>
          </View>
        </>
      ) : type === "wallpapers" ? (
        <>
          <View style={[styles.tableHeaderCell, styles.snoColumn]}>
            <Text style={styles.headerText}>S.No</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.roomColumn]}>
            <Text style={styles.headerText}>Room</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.dimensionColumn]}>
            <Text style={styles.headerText}>Width (in)</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.dimensionColumn]}>
            <Text style={styles.headerText}>Height (in)</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Total Sqft</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.smallColumn]}>
            <Text style={styles.headerText}>Rolls</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Material Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.mediumColumn]}>
            <Text style={styles.headerText}>Implementation Cost</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.totalColumn]}>
            <Text style={styles.headerText}>Total</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.actionColumn]}>
            <Text style={styles.headerText}>Actions</Text>
          </View>
        </>
      ) : null}
    </>
  );
};

// TableRow component
const TableRow = ({
  type,
  m,
  index,
  id,
  router,
  deleteMeasurement,
  styles,
}) => {

  const getMosquitoWidth = () =>
    `${m.width || "-"}" (${m.widthFeet?.toFixed(1) || "-"}ft)`;
  const getMosquitoHeight = () =>
    `${m.height || "-"}" (${m.heightFeet?.toFixed(1) || "-"}ft)`;
  const getWallpaperRolls = () => {
    const squareInches =
      (parseFloat(m.width) || 0) * (parseFloat(m.height) || 0);
    const squareFeet = squareInches / 144;
    let rolls = squareFeet / 50;
    const decimal = rolls - Math.floor(rolls);
    if (decimal >= 0.3) {
      rolls = Math.ceil(rolls);
    } else {
      rolls = Math.max(1, Math.floor(rolls));
    }
    return rolls;
  };
  const getWallpaperSqft = () => {
    const squareInches =
      (parseFloat(m.width) || 0) * (parseFloat(m.height) || 0);
    return (squareInches / 144).toFixed(2);
  };
  if (type === "flooring") {
    return (
      <View
        key={m.id}
        style={[
          styles.tableRow,
          index % 2 === 0 ? styles.evenRow : styles.oddRow,
        ]}
      >
        <View style={[styles.tableCell, styles.snoColumn]}>
          <Text style={styles.cellText}>{index + 1}</Text>
        </View>
        <View style={[styles.tableCell, styles.roomColumn]}>
          <Text style={styles.cellText}>{m.roomLabel || "Untitled"}</Text>
        </View>
        <View style={[styles.tableCell, styles.dimensionColumn]}>
          <Text style={styles.cellText}>{m.height || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.dimensionColumn]}>
          <Text style={styles.cellText}>{m.width || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>{m.totalSqft?.toFixed(2) || "-"}</Text>
        </View>        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            ₹{m.costOfRoom?.toLocaleString("en-IN") || "-"}
          </Text>
          {m.totalSqft && m.costPerSqft && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {m.totalSqft?.toFixed(2)} sqft × ₹{m.costPerSqft}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            ₹{m.layingCharge?.toLocaleString("en-IN") || "-"}
          </Text>
          {m.totalSqft && m.layingPerSqft && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {m.totalSqft?.toFixed(2)} sqft × ₹{m.layingPerSqft}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.totalColumn]}>
          <Text style={[styles.cellText, styles.totalCostText]}>
            ₹{m.totalCost?.toLocaleString("en-IN") || "-"}
          </Text>
        </View>
        <View style={[styles.tableCell, styles.actionColumn]}>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/new-measurement/[type]",
                  params: { id, type, editId: m.id },
                })
              }
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteMeasurement(m.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  if (type === "curtains") {
    return (
      <View
        key={m.id}
        style={[
          styles.tableRow,
          index % 2 === 0 ? styles.evenRow : styles.oddRow,
        ]}
      >
        <View style={[styles.tableCell, styles.snoColumn]}>
          <Text style={styles.cellText}>{index + 1}</Text>
        </View>
        <View style={[styles.tableCell, styles.roomColumn]}>
          <Text style={styles.cellText}>{m.roomLabel || "Untitled"}</Text>
        </View>
        <View style={[styles.tableCell, styles.dimensionColumn]}>
          <Text style={styles.cellText}>{m.width || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.dimensionColumn]}>
          <Text style={styles.cellText}>{m.height || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.smallColumn]}>
          <Text style={styles.cellText}>{m.parts || m.pieces || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.typeColumn]}>
          <Text style={styles.cellText}>
            {m.stitchingModel || m.curtainType || "-"}
          </Text>
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            {m.mainMetre?.toFixed(2) || m.totalMeters?.toFixed(2) || "-"}
          </Text>
        </View>        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            ₹{m.clothCost?.toLocaleString("en-IN") || "-"}
          </Text>
          {m.mainMetre && m.clothRatePerMeter && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {m.mainMetre?.toFixed(2)}m × ₹{m.clothRatePerMeter}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            ₹{m.stitchingCost?.toLocaleString("en-IN") || "-"}
          </Text>
          {m.parts && m.stitchingCostPerPart && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {m.parts} × ₹{m.stitchingCostPerPart}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            {m.hasLining
              ? m.liningMetre?.toFixed(2) ||
                m.totalLiningMeters?.toFixed(2) ||
                "-"
              : "-"}
          </Text>
        </View>        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            {m.hasLining
              ? `₹${
                  m.liningCost?.toLocaleString("en-IN") ||
                  m.totalLiningCost?.toLocaleString("en-IN") ||
                  "0"
                }`
              : "-"}
          </Text>
          {m.hasLining && m.liningMetre && m.liningRatePerMeter && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {m.liningMetre?.toFixed(2)}m × ₹{m.liningRatePerMeter}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.totalColumn]}>
          <Text style={[styles.cellText, styles.totalCostText]}>
            ₹
            {m.totalCurtainCost?.toLocaleString("en-IN") ||
              m.totalCost?.toLocaleString("en-IN") ||
              "-"}
          </Text>
        </View>
        <View style={[styles.tableCell, styles.actionColumn]}>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={() => {
                // Check if we're in a curtain room context
                const { roomId, roomName } = m;
                const isCurtainRoom = type === 'curtains' && roomId && roomName;
                router.push({
                  pathname: "/new-measurement/[type]",
                  params: isCurtainRoom 
                    ? { id, type, editId: m.id, roomId, roomName }
                    : { id, type, editId: m.id },
                });
              }}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteMeasurement(m.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  if (type === "blinds") {
    const isRoman = m.blindType && m.blindType.toLowerCase() === "roman blinds";
    return (
      <View
        key={m.id}
        style={[
          styles.tableRow,
          index % 2 === 0 ? styles.evenRow : styles.oddRow,
        ]}
      >
        <View style={[styles.tableCell, styles.snoColumn]}>
          <Text style={styles.cellText}>{index + 1}</Text>
        </View>
        <View style={[styles.tableCell, styles.roomColumn]}>
          <Text style={styles.cellText}>{m.roomLabel || "Untitled"}</Text>
        </View>
        <View style={[styles.tableCell, styles.dimensionColumn]}>
          <Text style={styles.cellText}>{m.height || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.dimensionColumn]}>
          <Text style={styles.cellText}>{m.width || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>{m.totalSqft?.toFixed(2) || "-"}</Text>
        </View>        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            ₹{m.blindsCost?.toLocaleString("en-IN") || "-"}
          </Text>
          {m.totalSqft && m.costPerSqft && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {m.totalSqft?.toFixed(2)} sqft × ₹{m.costPerSqft}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.typeColumn]}>
          <Text style={styles.cellText}>{m.blindType || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.smallColumn]}>
          <Text style={styles.cellText}>{isRoman ? m.part || "-" : "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            {isRoman ? m.clothRequired?.toFixed(2) || "-" : "-"}
          </Text>
        </View>        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            {isRoman ? `₹${m.clothCost?.toLocaleString("en-IN")}` : "-"}
          </Text>
          {isRoman && m.clothRequired && m.clothCostPerSqft && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {m.clothRequired?.toFixed(2)}m × ₹{m.clothCostPerSqft}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            {isRoman ? `₹${m.stitchingCost?.toLocaleString("en-IN")}` : "-"}
          </Text>
          {isRoman && m.part && m.stitchingCostPerPart && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {m.part} × ₹{m.stitchingCostPerPart}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.totalColumn]}>
          <Text style={[styles.cellText, styles.totalCostText]}>
            ₹{m.totalCost?.toLocaleString("en-IN") || "-"}
          </Text>
        </View>
        <View style={[styles.tableCell, styles.actionColumn]}>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/new-measurement/[type]",
                  params: { id, type, editId: m.id },
                })
              }
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteMeasurement(m.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  if (type === "mosquito-nets") {
    return (
      <View
        key={m.id}
        style={[
          styles.tableRow,
          index % 2 === 0 ? styles.evenRow : styles.oddRow,
        ]}
      >
        <View style={[styles.tableCell, styles.snoColumn]}>
          <Text style={styles.cellText}>{index + 1}</Text>
        </View>
        <View style={[styles.tableCell, styles.roomColumn]}>
          <Text style={styles.cellText}>{m.roomLabel || "Untitled"}</Text>
        </View>
        <View style={[styles.tableCell, styles.dimensionColumn]}>
          <Text style={styles.cellText}>{getMosquitoWidth()}</Text>
        </View>
        <View style={[styles.tableCell, styles.dimensionColumn]}>
          <Text style={styles.cellText}>{getMosquitoHeight()}</Text>
        </View>
        <View style={[styles.tableCell, styles.typeColumn]}>
          <Text style={styles.cellText}>{m.materialType || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.costColumn]}>
          <Text style={styles.cellText}>₹{m.materialRatePerSqft || "0"}</Text>
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>{m.totalSqft?.toFixed(2) || "-"}</Text>
        </View>        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            ₹{m.materialCost?.toLocaleString("en-IN") || "-"}
          </Text>
          {m.totalSqft && m.materialRatePerSqft && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {m.totalSqft?.toFixed(2)} sqft × ₹{m.materialRatePerSqft}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>{m.customDescription || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.actionColumn]}>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/new-measurement/[type]",
                  params: { id, type, editId: m.id },
                })
              }
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteMeasurement(m.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  if (type === "wallpapers") {
    // Calculate materialCost and implementationCost if not present
    const squareInches =
      (parseFloat(m.width) || 0) * (parseFloat(m.height) || 0);
    const squareFeet = squareInches / 144;
    let rolls = squareFeet / 50;
    const decimal = rolls - Math.floor(rolls);
    if (decimal >= 0.3) {
      rolls = Math.ceil(rolls);
    } else {
      rolls = Math.max(1, Math.floor(rolls));
    }
    const materialCost =
      m.materialCost !== undefined
        ? m.materialCost
        : rolls * (parseFloat(m.costPerRoll) || 0);
    const implementationCost =
      m.implementationCost !== undefined
        ? m.implementationCost
        : rolls * (parseFloat(m.implementationCostPerRoll) || 0);
    const totalCost =
      m.totalCost !== undefined
        ? m.totalCost
        : materialCost + implementationCost;
    return (
      <View
        key={m.id}
        style={[
          styles.tableRow,
          index % 2 === 0 ? styles.evenRow : styles.oddRow,
        ]}
      >
        <View style={[styles.tableCell, styles.snoColumn]}>
          <Text style={styles.cellText}>{index + 1}</Text>
        </View>
        <View style={[styles.tableCell, styles.roomColumn]}>
          <Text style={styles.cellText}>{m.roomLabel || "Untitled"}</Text>
        </View>
        <View style={[styles.tableCell, styles.dimensionColumn]}>
          <Text style={styles.cellText}>{m.width || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.dimensionColumn]}>
          <Text style={styles.cellText}>{m.height || "-"}</Text>
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>{getWallpaperSqft()}</Text>
        </View>
        <View style={[styles.tableCell, styles.smallColumn]}>
          <Text style={styles.cellText}>{rolls}</Text>
        </View>        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            ₹{Math.floor(materialCost).toLocaleString("en-IN")}
          </Text>
          {rolls && m.costPerRoll && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {rolls} rolls × ₹{m.costPerRoll}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.mediumColumn]}>
          <Text style={styles.cellText}>
            ₹{Math.floor(implementationCost).toLocaleString("en-IN")}
          </Text>
          {rolls && m.implementationCostPerRoll && (
            <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
              {rolls} rolls × ₹{m.implementationCostPerRoll}
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.totalColumn]}>
          <Text style={[styles.cellText, styles.totalCostText]}>
            ₹{Math.floor(totalCost).toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={[styles.tableCell, styles.actionColumn]}>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={() => {
                // Check if we're in a curtain room context
                const { roomId, roomName } = m;
                const isCurtainRoom = type === 'curtains' && roomId && roomName;
                router.push({
                  pathname: "/new-measurement/[type]",
                  params: isCurtainRoom 
                    ? { id, type, editId: m.id, roomId, roomName }
                    : { id, type, editId: m.id },
                });
              }}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteMeasurement(m.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  return null;
};

// SummaryRow component
const SummaryRow = ({ type, measurements, styles }) => {
  // Helper functions for summary logic
  const getTotal = (key) =>
    measurements.reduce((sum, m) => sum + (parseFloat(m[key]) || 0), 0);
  const getBlindsTotal = () =>
    measurements.reduce((sum, m) => sum + (parseFloat(m.totalCost) || 0), 0);
  const getWallpaperRollsTotal = () =>
    measurements.reduce((sum, m) => {
      const squareInches =
        (parseFloat(m.width) || 0) * (parseFloat(m.height) || 0);
      const squareFeet = squareInches / 144;
      let rolls = squareFeet / 50;
      const decimal = rolls - Math.floor(rolls);
      if (decimal >= 0.3) {
        rolls = Math.ceil(rolls);
      } else {
        rolls = Math.max(1, Math.floor(rolls));
      }
      return sum + rolls;
    }, 0);
  return (
    <View style={styles.summaryRow}>
      {type === "flooring" ? (
        <>
          <View style={[styles.tableCell, styles.snoColumn]}>
            <Text style={styles.summaryText}>Total</Text>
          </View>
          <View style={[styles.tableCell, styles.roomColumn]}>
            <Text style={styles.summaryText}>
              ({measurements.length} rooms)
            </Text>
          </View>
          <View style={[styles.tableCell, styles.dimensionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.dimensionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              {getTotal("totalSqft").toFixed(2)}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              ₹{getTotal("costOfRoom").toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              ₹{getTotal("layingCharge").toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.totalColumn]}>
            <Text style={styles.summaryTotalText}>
              ₹{getTotal("totalCost").toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.actionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
        </>
      ) : type === "curtains" ? (
        <>
          <View style={[styles.tableCell, styles.snoColumn]}>
            <Text style={styles.summaryText}>Total</Text>
          </View>
          <View style={[styles.tableCell, styles.roomColumn]}>
            <Text style={styles.summaryText}>
              ({measurements.length} rooms)
            </Text>
          </View>
          <View style={[styles.tableCell, styles.dimensionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.dimensionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.smallColumn]}>
            <Text style={styles.summaryText}>
              {getTotal("parts") || getTotal("pieces")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.typeColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              {(getTotal("mainMetre") || getTotal("totalMeters")).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              ₹{getTotal("clothCost").toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              ₹{getTotal("stitchingCost").toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              {(
                getTotal("liningMetre") || getTotal("totalLiningMeters")
              ).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              ₹
              {(
                getTotal("liningCost") || getTotal("totalLiningCost")
              ).toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.totalColumn]}>
            <Text style={styles.summaryTotalText}>
              ₹
              {(
                getTotal("totalCurtainCost") || getTotal("totalCost")
              ).toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.actionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
        </>
      ) : type === "blinds" ? (
        <>
          <View style={[styles.tableCell, styles.snoColumn]}>
            <Text style={styles.summaryText}>Total</Text>
          </View>
          <View style={[styles.tableCell, styles.roomColumn]}>
            <Text style={styles.summaryText}>
              ({measurements.length} rooms)
            </Text>
          </View>
          <View style={[styles.tableCell, styles.dimensionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.dimensionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              {getTotal("totalSqft").toFixed(2)}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              ₹{getTotal("blindsCost").toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.typeColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.smallColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.totalColumn]}>
            <Text style={styles.summaryTotalText}>
              ₹{getBlindsTotal().toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.actionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
        </>
      ) : type === "mosquito-nets" ? (
        <>
          <View style={[styles.tableCell, styles.snoColumn]}>
            <Text style={styles.summaryText}>Total</Text>
          </View>
          <View style={[styles.tableCell, styles.roomColumn]}>
            <Text style={styles.summaryText}>
              ({measurements.length} rooms)
            </Text>
          </View>
          <View style={[styles.tableCell, styles.dimensionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.dimensionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.typeColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.costColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              {getTotal("totalSqft").toFixed(2)}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              ₹{getTotal("materialCost").toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.actionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
        </>
      ) : type === "wallpapers" ? (
        <>
          <View style={[styles.tableCell, styles.snoColumn]}>
            <Text style={styles.summaryText}>Total</Text>
          </View>
          <View style={[styles.tableCell, styles.roomColumn]}>
            <Text style={styles.summaryText}>
              ({measurements.length} rooms)
            </Text>
          </View>
          <View style={[styles.tableCell, styles.dimensionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.dimensionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              {getTotal("totalSqft").toFixed(2)}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.smallColumn]}>
            <Text style={styles.summaryText}>{getWallpaperRollsTotal()}</Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              ₹{getTotal("materialCost").toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.mediumColumn]}>
            <Text style={styles.summaryText}>
              ₹{getTotal("implementationCost").toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.totalColumn]}>
            <Text style={styles.summaryTotalText}>
              ₹{getTotal("totalCost").toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.actionColumn]}>
            <Text style={styles.summaryText}>-</Text>
          </View>
        </>
      ) : null}
    </View>
  );
};

// RodCostTable component for curtains
const RodCostTable = ({ measurements, styles }) => {
  return (
    <View style={[styles.table, { marginTop: 20, minWidth: 760 }]}>
      {" "}
      <Text style={styles.tableTitle}>Rod Cost</Text>
      <View style={styles.tableHeader}>
        <View style={[styles.tableHeaderCell, styles.rodSnoColumn]}>
          <Text style={styles.headerText}>S.No</Text>
        </View>
        <View style={[styles.tableHeaderCell, styles.rodBracketColumn]}>
          <Text style={styles.headerText}>Curtain Wall Bracket</Text>
        </View>
        <View style={[styles.tableHeaderCell, styles.rodFeetColumn]}>
          <Text style={styles.headerText}>Rod Feet</Text>
        </View>
        <View style={[styles.tableHeaderCell, styles.rodClampColumn]}>
          <Text style={styles.headerText}>Clamp Cost</Text>
        </View>
        <View style={[styles.tableHeaderCell, styles.rodDoomColumn]}>
          <Text style={styles.headerText}>Doom Cost</Text>
        </View>
        <View style={[styles.tableHeaderCell, styles.rodTotalColumn]}>
          <Text style={styles.headerText}>Total Wall Bracket Cost</Text>
        </View>
      </View>
      {/* Rows */}
      {measurements.map((m, index) => (
        <View
          key={m.id}
          style={[
            styles.tableRow,
            index % 2 === 0 ? styles.evenRow : styles.oddRow,
          ]}
        >
          {" "}
          <View style={[styles.tableCell, styles.rodSnoColumn]}>
            <Text style={styles.cellText}>{index + 1}</Text>
          </View>
          <View style={[styles.tableCell, styles.rodBracketColumn]}>
            <Text style={styles.cellText}>{m.curtainBracketModels || "-"}</Text>
          </View>{" "}
          <View style={[styles.tableCell, styles.rodFeetColumn]}>
            <Text style={styles.cellText}>
              {m.rodFeet?.toFixed(2) || m.rodLength?.toFixed(2) || "-"}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.rodClampColumn]}>
            <Text style={styles.cellText}>
              ₹{m.clampCost?.toLocaleString("en-IN") || "0"}
            </Text>
            {m.clampRequired && m.clampRatePerPiece && (
              <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
                {m.clampRequired} × ₹{m.clampRatePerPiece}
              </Text>
            )}
          </View>
          <View style={[styles.tableCell, styles.rodDoomColumn]}>
            <Text style={styles.cellText}>
              ₹{m.doomCost?.toLocaleString("en-IN") || "0"}
            </Text>
            {m.doomRequired && m.doomRatePerPiece && (
              <Text style={[styles.cellText, { fontSize: 10, color: "#666" }]}>
                {m.doomRequired} × ₹{m.doomRatePerPiece}
              </Text>
            )}
          </View>
          <View style={[styles.tableCell, styles.rodTotalColumn]}>
            <Text style={[styles.cellText, styles.totalCostText]}>
              ₹{m.totalWallBracketCost?.toLocaleString("en-IN") || "0"}
            </Text>
          </View>
        </View>
      ))}{" "}
      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={[styles.tableCell, styles.rodSnoColumn]}>
          <Text style={styles.summaryText}>Total</Text>
        </View>
        <View style={[styles.tableCell, styles.rodBracketColumn]}>
          <Text style={styles.summaryText}>({measurements.length} items)</Text>
        </View>
        <View style={[styles.tableCell, styles.rodFeetColumn]}>
          <Text style={styles.summaryText}>
            {measurements
              .reduce((sum, m) => sum + (m.rodFeet || m.rodLength || 0), 0)
              .toFixed(2)}{" "}
            ft
          </Text>
        </View>
        <View style={[styles.tableCell, styles.rodClampColumn]}>
          <Text style={styles.summaryText}>
            ₹
            {measurements
              .reduce((sum, m) => sum + (m.clampCost || 0), 0)
              .toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.summaryText, { fontSize: 10, color: "#666" }]}>
            Total:{" "}
            {measurements.reduce((sum, m) => sum + (m.clampRequired || 0), 0)}{" "}
            pieces
          </Text>
        </View>
        <View style={[styles.tableCell, styles.rodDoomColumn]}>
          <Text style={styles.summaryText}>
            ₹
            {measurements
              .reduce((sum, m) => sum + (m.doomCost || 0), 0)
              .toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.summaryText, { fontSize: 10, color: "#666" }]}>
            Total:{" "}
            {measurements.reduce((sum, m) => sum + (m.doomRequired || 0), 0)}{" "}
            pieces
          </Text>
        </View>
        <View style={[styles.tableCell, styles.rodTotalColumn]}>
          <Text style={styles.summaryTotalText}>
            ₹
            {measurements
              .reduce((sum, m) => sum + (m.totalWallBracketCost || 0), 0)
              .toLocaleString("en-IN")}
          </Text>
        </View>
      </View>{" "}
      
    </View>
  );
};

// TotalCostSummary component for curtains
const TotalCostSummary = ({ measurements, styles }) => {
  // Calculate totals from measurements
  const curtainTotal = measurements.reduce(
    (sum, m) => sum + (m.totalCurtainCost || m.totalCost || 0),
    0
  );
  const wallBracketTotal = measurements.reduce(
    (sum, m) => sum + (m.totalWallBracketCost || 0),
    0
  );  const rodCalculationTotal = measurements.reduce(
    (sum, m) =>
      sum + (m.totalRodsRequired || 0) * parseFloat(m.rodRatePerLength || 0),
    0
  );
  // Calculate total rods required using project-level optimization
  const widths = measurements.map(m => parseFloat(m.width) || 0);
  const rodCalc = calculateRods(widths);
  const totalRodsRequired = rodCalc.totalRods;
    // Calculate project-level rod cost
  const rodRatePerLength = measurements.length > 0 ? (parseFloat(measurements[0].rodRatePerLength) || 0) : 0;
  const projectLevelRodCost = Math.ceil(totalRodsRequired * rodRatePerLength);
  // Calculate GST
  const clothGST = Math.ceil(curtainTotal * 0.05); // 5% GST on cloth
  const totalRodCostBeforeGST = wallBracketTotal + projectLevelRodCost; // Use project-level rod cost
  const rodGST = Math.ceil(totalRodCostBeforeGST * 0.18); // 18% GST on rod

  const clothCostWithGST = curtainTotal + clothGST;
  const rodCostWithGST = totalRodCostBeforeGST + rodGST;
  const grandTotal = clothCostWithGST + rodCostWithGST;
  return (
    <View style={[styles.table, { marginTop: 20, minWidth: "auto" }]}>
      <Text style={styles.tableTitle}>Total Cost Summary</Text>

      {/* Total Rods Required */}
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, { flex: 2 }]}>
          <Text style={styles.cellText}>Total Rods Required</Text>
        </View>
        <View style={[styles.tableCell, { flex: 1 }]}>
          <Text style={[styles.cellText, styles.costText]}>
            {totalRodsRequired} rods
          </Text>
        </View>
      </View>      {/* Total Wall Brackets Cost */}
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, { flex: 2 }]}>
          <Text style={styles.cellText}>Total Wall Brackets Cost</Text>
        </View>
        <View style={[styles.tableCell, { flex: 1 }]}>
          <Text style={[styles.cellText, styles.costText]}>
            ₹{wallBracketTotal.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* Rod Calculation Cost */}
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, { flex: 2 }]}>
          <Text style={styles.cellText}>Rod Calculation Cost</Text>
        </View>
        <View style={[styles.tableCell, { flex: 1 }]}>
          <Text style={[styles.cellText, styles.costText]}>
            ₹{projectLevelRodCost.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* Cloth Cost with GST */}
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, { flex: 2 }]}>
          <Text style={styles.cellText}>Cloth Cost (with 5% GST)</Text>
        </View>
        <View style={[styles.tableCell, { flex: 1 }]}>
          <Text style={[styles.cellText, styles.costText]}>
            ₹{clothCostWithGST.toFixed(0).toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* Rod Cost with GST */}
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, { flex: 2 }]}>
          <Text style={styles.cellText}>Rod Cost (with 18% GST)</Text>
        </View>
        <View style={[styles.tableCell, { flex: 1 }]}>
          <Text style={[styles.cellText, styles.costText]}>
            ₹{rodCostWithGST.toFixed(0).toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* Grand Total */}
      <View
        style={[
          styles.summaryRow,
          { borderTopWidth: 2, borderTopColor: COLORS.primary },
        ]}
      >
        <View style={[styles.tableCell, { flex: 2 }]}>
          <Text style={styles.summaryTotalText}>Grand Total</Text>
        </View>
        <View style={[styles.tableCell, { flex: 1 }]}>
          <Text style={styles.summaryTotalText}>
            ₹{grandTotal.toFixed(0).toLocaleString("en-IN")}
          </Text>
        </View>
      </View>
    </View>
  );
};

function renderTable({
  type,
  measurements,
  id,
  router,
  deleteMeasurement,
  styles,
}) {
  return (
    <View style={styles.table}>
      {/* Add title for curtains table */}
      {type === "curtains" && (
        <Text style={styles.tableTitle}>Table 1 - Curtain Cost</Text>
      )}
      <View style={styles.tableHeader}>
        <TableHeader type={type} />
      </View>
      {measurements.map((m, index) => (
        <TableRow
          key={m.id}
          type={type}
          m={m}
          index={index}
          id={id}
          router={router}
          deleteMeasurement={deleteMeasurement}
          styles={styles}
        />
      ))}
      <SummaryRow type={type} measurements={measurements} styles={styles} />
    </View>
  );
}

export default function InteriorMeasurements() {
  const { id, type, roomId, roomName } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const isCurtainRoom = type === 'curtains' && roomId && roomName;

  const loadProject = useCallback(async () => {
    try {
      const projectsData = await AsyncStorage.getItem("projects");
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        const currentProject = projects.find((p) => p.id === id);
        
        if (currentProject) {
          setProject(currentProject);
          
          if (isCurtainRoom) {
            // Special handling for curtain rooms
            if (!currentProject.curtainRooms) {
              currentProject.curtainRooms = [];
            }
            
            const room = currentProject.curtainRooms.find(r => r.id === roomId);
            if (room) {
              if (!room.measurements) {
                room.measurements = [];
              }
              setMeasurements(room.measurements);
            } else {
              Alert.alert("Error", "Room not found");
              router.back();
            }
          } else {
            // Regular flow for other interior types
            setMeasurements(
              currentProject?.measurements?.filter(
                (m) => m.interiorType === type
              ) || []
            );
          }
        } else {
          Alert.alert("Error", "Project not found");
          router.back();
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
    }
  }, [id, type, roomId, isCurtainRoom]);

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProject();
    }, [loadProject])
  );

  const deleteMeasurement = async (measurementId) => {
    Alert.alert(
      "Delete Measurement",
      "Are you sure you want to delete this measurement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const projectsData = await AsyncStorage.getItem("projects");
              const projects = JSON.parse(projectsData);
              const projectIndex = projects.findIndex((p) => p.id === id);
              
              if (projectIndex !== -1) {
                if (isCurtainRoom) {
                  // Handle curtain room measurement deletion
                  const roomIndex = projects[projectIndex].curtainRooms.findIndex(
                    (r) => r.id === roomId
                  );
                  
                  if (roomIndex !== -1) {
                    projects[projectIndex].curtainRooms[roomIndex].measurements = 
                      projects[projectIndex].curtainRooms[roomIndex].measurements.filter(
                        (m) => m.id !== measurementId
                      );
                    
                    await AsyncStorage.setItem(
                      "projects",
                      JSON.stringify(projects)
                    );
                  }
                } else {
                  // Regular flow for other interior types
                  projects[projectIndex].measurements = projects[
                    projectIndex
                  ].measurements.filter((m) => m.id !== measurementId);
                  
                  await AsyncStorage.setItem(
                    "projects",
                    JSON.stringify(projects)
                  );
                }
                
                loadProject(); // Reload the data
              }
            } catch (error) {
              console.error("Error deleting measurement:", error);
            }
          },
        },
      ]
    );
  };

  const getInteriorTypeLabel = () => {
    return INTERIOR_SCHEMAS[type]?.label || type;
  };
  if (!project) {
    return (
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
    );
  }
  return (
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
            <Text style={styles.headerTitle}>{project.clientName}</Text>
            <Text style={styles.headerSubtitle}>
              {isCurtainRoom ? `${roomName} Room • ` : ''}{getInteriorTypeLabel()} • {measurements.length}{" "}
              {measurements.length === 1 ? "measurement" : "measurements"}
            </Text>
          </View>
        </View>
      </View>

      {/* Measurements Table */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tableContainer}>
          {measurements.length === 0 ? (
            <View style={styles.emptyCard}>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.95)",
                  "rgba(255, 255, 255, 0.85)",
                ]}
                style={styles.emptyCardGradient}
              >
                <Ionicons
                  name="document-outline"
                  size={64}
                  color={COLORS.gray400}
                />
                <Text style={styles.emptyMessage}>No measurements yet</Text>
                <Text style={styles.emptySubMessage}>
                  Add your first measurement to get started
                </Text>
                <View style={styles.emptyHint}>
                  <Ionicons
                    name="bulb-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.emptyHintText}>
                    Use the button below to add your first{" "}
                    {getInteriorTypeLabel().toLowerCase()} measurement
                  </Text>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <>

              {/* Table Card */}
              <View style={styles.tableCard}>
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.95)",
                    "rgba(255, 255, 255, 0.85)",
                  ]}
                  style={styles.tableCardGradient}
                >
                  {/* Horizontal scroll wrapper for tables */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    style={styles.horizontalScrollView}
                  >
                    {renderTable({
                      type,
                      measurements,
                      id,
                      router,
                      deleteMeasurement,
                      styles,
                    })}
                  </ScrollView>
                </LinearGradient>
              </View>

              {/* Add Rod Cost Table and Total Cost Summary for curtains */}
              {type === "curtains" && measurements.length > 0 && (
                <>
                  <View style={styles.tableCard}>
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.95)",
                        "rgba(255, 255, 255, 0.85)",
                      ]}
                      style={styles.tableCardGradient}
                    >
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        style={styles.horizontalScrollView}
                      >
                        <RodCostTable
                          measurements={measurements}
                          styles={styles}
                        />
                      </ScrollView>
                    </LinearGradient>
                  </View>

                  <View style={styles.tableCard}>
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.95)",
                        "rgba(255, 255, 255, 0.85)",
                      ]}
                      style={styles.tableCardGradient}
                    >
                      <TotalCostSummary
                        measurements={measurements}
                        styles={styles}
                      />
                    </LinearGradient>
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Measurement Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          router.push({
            pathname: "/new-measurement/[type]",
            params: isCurtainRoom 
              ? { id, type, roomId, roomName } 
              : { id, type },
          })
        }
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.accent, COLORS.secondary]}
          style={styles.addButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Measurement</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
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
    justifyContent: "space-between",
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
  },
  tableContainer: {
    padding: 20,
  },

  // Empty State Card
  emptyCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  emptyCardGradient: {
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  emptyMessage: {
    fontSize: 20,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  emptySubMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyHint: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(" +
      COLORS.primary
        .slice(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16))
        .join(",") +
      ", 0.1)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    gap: 8,
  },
  emptyHintText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },

  // Scroll Hint Card
  scrollHintCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollHintGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    gap: 8,
  },
  scrollHintText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },

  // Table Card
  tableCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  tableCardGradient: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  horizontalScrollView: {
    flexGrow: 0,
  },
  table: {
    backgroundColor: "transparent",
    borderRadius: 0,
    elevation: 0,
    shadowOpacity: 0,
    overflow: "hidden",
    borderWidth: 0,
    minWidth: 1000, // Ensure table is wide enough to scroll horizontally
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    padding: 16,
    backgroundColor:
      "rgba(" +
      COLORS.primary
        .slice(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16))
        .join(",") +
      ", 0.1)",
    borderBottomWidth: 1,
    borderBottomColor:
      "rgba(" +
      COLORS.primary
        .slice(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16))
        .join(",") +
      ", 0.2)",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.2)",
  },
  headerText: {
    color: COLORS.textInverse,
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor:
      "rgba(" +
      COLORS.primary
        .slice(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16))
        .join(",") +
      ", 0.1)",
  },
  summaryRow: {
    flexDirection: "row",
    minHeight: 50,
    backgroundColor:'#fff',
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  evenRow: {
    backgroundColor: "transparent",
  },
  oddRow: {
    backgroundColor:
      "rgba(" +
      COLORS.primary
        .slice(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16))
        .join(",") +
      ", 0.02)",
  },
  tableCell: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor:
      "rgba(" +
      COLORS.primary
        .slice(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16))
        .join(",") +
      ", 0.1)",
  },
  cellText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
  costText: {
    color: COLORS.success,
    fontWeight: "600",
  },
  totalCostText: {
    color: COLORS.error,
    fontWeight: "bold",
    fontSize: 13,
  },
  summaryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontWeight: "600",
  },
  summaryTotalText: {
    fontSize: 13,
    color: COLORS.error,
    textAlign: "center",
    fontWeight: "bold",
  },

  // Circled pieces for one part curtains
  circledPieces: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  normalPieces: {
    justifyContent: "center",
    alignItems: "center",
  },
  circledText: {
    color: "white",
    fontWeight: "bold",
  },
  // Column widths - adjusted for better proportions and horizontal scrolling
  roomColumn: {
    width: 120,
  },
  dimensionColumn: {
    width: 80,
  },
  typeColumn: {
    width: 110,
  },
  smallColumn: {
    width: 60,
  },
  mediumColumn: {
    width: 90,
  },
  costColumn: {
    width: 90,
  },
  totalColumn: {
    width: 110,
  },
  actionColumn: {
    width: 90,
    borderRightWidth: 0,
  },
  snoColumn: {
    width: 50,
  },

  // Rod Cost Table specific column widths (6 columns total)
  rodSnoColumn: {
    width: 60,
  },
  rodBracketColumn: {
    width: 200,
  },
  rodFeetColumn: {
    width: 100,
  },
  rodClampColumn: {
    width: 120,
  },
  rodDoomColumn: {
    width: 120,
  },
  rodTotalColumn: {
    width: 160,
    borderRightWidth: 0,
  },

  actionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 6,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    padding: 8,
    borderRadius: 6,
    elevation: 2,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  // Add button
  addButton: {
    borderRadius: 16,
    overflow: "hidden",
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Remove unused styles that are no longer needed with the new design
  measurementCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  measurementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  measurementRoom: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  measurementActions: {
    flexDirection: "row",
    gap: 8,
  },
  measurementDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  measurementText: {
    fontSize: 14,
    color: "#374151",
  },
  measurementCost: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
});
