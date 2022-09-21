/*
 * @Author: msc
 * @Date: 2022-09-20 21:11:23
 * @LastEditTime: 2022-09-20 21:16:07
 * @LastEditors: msc
 * @Description: 
 */


import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
const Timer = () => {

    const [time, setTime] = useState(Date.now());
    // init
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now());
        }, 24);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <Text style={styles.text}>{time}</Text>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 30,
        color: "black"
    }
})

export default Timer;

