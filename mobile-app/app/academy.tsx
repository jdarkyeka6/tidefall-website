import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AcademyScreen() {
  return <SafeAreaView style={styles.screen}><View><Text style={styles.kicker}>TIDEFALL ACADEMY</Text><Text style={styles.title}>Academy</Text><Text style={styles.body}>The Academy map, rooms, dorms, secrets and interactive exploration will live here.</Text></View></SafeAreaView>;
}
const styles = StyleSheet.create({screen:{flex:1,backgroundColor:'#06141E',padding:24},kicker:{color:'#78DDF2',fontSize:11,fontWeight:'800',letterSpacing:2.5,marginTop:24},title:{color:'#F4FBFE',fontSize:40,fontWeight:'900',marginTop:8},body:{color:'#9FB5BF',fontSize:16,lineHeight:24,marginTop:16}});
