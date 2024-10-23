import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { greetings } from "../../utils/greetings";
import { Colors } from "../../constants/color";
import DefaultPic from "../../assets/default-profile.jpg";
import Ionicons from "react-native-vector-icons/Ionicons";
import _ from "lodash";

export default function UserHome({
  user,
  navigation,
  handleGoHome,
  latestOngoingBooking,
}) {

  const handleGoSettings = () => {
    navigation.push("Settings");
  };

  const handleGoSettingsDebounced = _.debounce(handleGoSettings, 350, {
    leading: true,
    trailing: false,
  });

  return (
    <View style={styles.header}>
      <View style={styles.userContainer}>
        <Pressable onPress={handleGoSettingsDebounced}>
          <Image
            style={styles.profilePic}
            source={user?.profilePic ? { uri: user.profilePic } : DefaultPic}
          />
        </Pressable>
        <View>
          <Text style={styles.greetings}>{greetings()}</Text>
          <Text
            style={styles.username}
          >{`${user?.firstName} ${user?.lastName}`}</Text>
        </View>
      </View>
      {!latestOngoingBooking ? (
        <Pressable onPress={handleGoHome} style={styles.homeBtn}>
          <Ionicons name="location" color={Colors.error400} size={25} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profilePic: {
    width: 50,
    height: 50,
    backgroundColor: Colors.secondaryColor,
    borderColor: Colors.secondaryColor,
    borderWidth: 2,
    borderRadius: 50,
  },
  greetings: {
    fontSize: 15,
    color: Colors.textColor,
    fontFamily: "DMSans_500Medium",
  },
  username: {
    fontSize: 20,
    color: Colors.textColor,
    fontFamily: "DMSans_700Bold",
  },
});
