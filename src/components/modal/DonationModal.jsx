import { Modal, View, Text, StyleSheet, Image } from "react-native";
import { Colors } from "../../constants/color";
import Button from "../ui/Button";
import Gcash from "../../assets/gcash.png";

export default function DonationModal({ visible, onRequestClose }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Would you like to donate?</Text>
          <Image source={Gcash} style={styles.donationImage} />
          <View style={styles.buttonContainer}>
            <View style={styles.buttonItem}>
              <Button text="Cancel" variant="danger" onPress={onRequestClose} />
            </View>
            <View style={styles.buttonItem}>
              <Button text="Yes" variant="primary" onPress={onRequestClose} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
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
    marginBottom: 15,
    textAlign: "center",
    color: Colors.textColor,
    fontFamily: "DMSans_500Medium",
    fontSize: 20
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonItem: {
    width: "48%",
  },
});
