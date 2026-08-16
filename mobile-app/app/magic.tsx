import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MagicScreen() {
  return <SafeAreaView style={styles.screen}><Text style={styles.kicker}>VOICE MAGIC</Text><Text style={styles.title}>Magic</Text><Text style={styles.body}>Your spellbook, discovered spells, casting practice and training challenges will live here.</Text></SafeAreaView>;
}
const styles = StyleSheet.create({screen:{flex:1,backgroundColor:'#06141E',padding:24},kicker:{color:'#78DDF2',fontSize:11,fontWeight:'800',letterSpacing:2.5,marginTop:24},title:{color:'#F4FBFE',fontSize:40,fontWeight:'900',marginTop:8},body:{color:'#9FB5BF',fontSize:16,lineHeight:24,marginTop:16}});
