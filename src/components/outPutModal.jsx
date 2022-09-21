/*
 * @Author: msc
 * @Date: 2022-09-19 22:11:31
 * @LastEditTime: 2022-09-19 22:51:12
 * @LastEditors: msc
 * @Description: 
 */

import { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button, Pressable, StatusBar, useWindowDimensions } from "react-native";




const Modal = ({ records, setModalVisible }) => {


    const width = useWindowDimensions().width;
    const height = useWindowDimensions().height;

    
    return (
        <View style={styles.centeredView}>
            <TextInput
                style={styles.fileName}
                value={fileName}
                onChangeText={setFileName}
                placeholder="please input filename"
            />
            <Button title="导出" />
            <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(pre => !pre)}
            >
                <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
            <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(pre => !pre)}
            >
                <Text style={styles.textStyle}>OK</Text>
            </Pressable>
        </View>
    )

}


const styles = StyleSheet.create({
    centeredView: {
        position: "absolute",
        left: "10%",
        top: "40%",
        right: "10%",

        justifyContent: "center",
        alignItems: "center",
        paddingTop: StatusBar.currentHeight,
        backgroundColor: "white",



    },

})

export default Modal;


