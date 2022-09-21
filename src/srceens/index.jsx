import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    View,
    StyleSheet,
    SafeAreaView,
    Text,
    SafeAreaViewBase,
    Button,
    TouchableOpacity,
    ScrollView,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Modal,
    Pressable,
    StatusBar,
    useWindowDimensions,
    ToastAndroid,
    PermissionsAndroid,
} from "react-native";
import * as fs from "expo-file-system";
import { StorageAccessFramework as saf } from "expo-file-system";
import * as Sharing from 'expo-sharing';
import Timer from "../components/timer";


const Home = () => {
    const [btns, setBtns] = useState(["A", "B", "C", "D"]);

    const [records, setRecords] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [fileName, setFileName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [files, setFiles] = useState([]);
    const [selectedFile, setSeletedFile] = useState("");

    const recordList = useRef(null);

    const Time = useMemo(() => (<Timer />), []);

    const colors = [
        "#ffb6c1",
        "#ffa07a",
        "#20b2aa",
        "#87cefa",
        "#778899",
        "#b0c4de",
        "lightyellow",
        "lime",
    ];

    const isExist = useCallback(async (fileName) => {
        try {
            const res = await fs.getInfoAsync(fs.documentDirectory + fileName + '.csv', { size: true, md5: true });
            return res.exists;
        } catch (e) {
            return false;
        }
    }, [fileName]);


    const toastMsg = (msg) => {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    }


    const handleSave = async () => {
        try {
            if (fileName.length === 0) {
                ToastAndroid.show("please input filename", ToastAndroid.SHORT);
                return;
            }
            if (records.length === 0) {
                ToastAndroid.show("please record data", ToastAndroid.SHORT);
                return;
            }
            let isPermitedExternalStorage = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
            let flag = false;
            if (!isPermitedExternalStorage) {
                // Ask for permission
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "Storage permission needed",
                        buttonNeutral: "Ask me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK",
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Permission granted');
                    flag = true;
                } else {
                    ToastAndroid.show("Permission denied", ToastAndroid.SHORT);
                }
            } else {
                flag = true;
            }
            if (flag) {
                const exist = await isExist(fileName);
                if (exist) {
                    ToastAndroid.show('file already exist', ToastAndroid.SHORT);
                } else {
                    setIsSaving(true);
                    const data = records.reduce((pre, cur) => {
                        return pre + cur.data + '\n';
                    }, 'type,timeStamp\n');
                    const url = fs.documentDirectory + fileName + '.csv';
                    console.log(data);
                    console.log(url);
                    const res = await fs.writeAsStringAsync(url, data);
                    console.log(res);
                    ToastAndroid.show("Saving succeeded \n" + url, ToastAndroid.SHORT);
                    setIsSaving(false);
                }
            }

        } catch (e) {
            ToastAndroid.show('Error!!!', ToastAndroid.SHORT);
            setIsSaving(false);
        }
    }

    const handleFiles = async () => {
        try {
            await fetchFiles();
            setModalVisible(true);
        } catch (e) {
            toastMsg("Can't open files");
        }
    }

    const fetchFiles = async () => {
        const res = await fs.readDirectoryAsync(fs.documentDirectory)
        let n = res.length;
        let fileArr = new Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            fileArr[n - i - 1] = res[i];
        }
        setFiles(fileArr);
    }

    const handleShare = async () => {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            const res = await Sharing.shareAsync(fs.documentDirectory + selectedFile);
            console.log('shareAsync', res)
        } else {
            toastMsg("Can't share")
        };
    }

    const handleDelete = async () => {
        try {
            await fs.deleteAsync(fs.documentDirectory + selectedFile);
            await fetchFiles();
            toastMsg('Successfully deleted ' + selectedFile);
        } catch (e) {
            toastMsg('Delete Error');
        }
    }



    return (
        <SafeAreaView
            style={[styles.container, { height: useWindowDimensions().height - StatusBar.currentHeight }]}>
            <View style={styles.outPutContainer}>
                <TextInput
                    textAlign="left"
                    style={styles.fileInput}
                    value={fileName}
                    maxLength={20}
                    onChangeText={setFileName}
                    placeholder="place input the file name" />

                <TouchableOpacity onPress={handleSave} style={[styles.optionBtn, { backgroundColor: "lightskyblue" }]}>
                    <Text style={{ fontSize: 16, color: "black" }}>save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleFiles} style={[styles.optionBtn, { backgroundColor: "lightgreen" }]}>
                    <Text style={{ fontSize: 16, color: "black" }}>files</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setRecords([])} style={[styles.optionBtn, { backgroundColor: "lightsalmon" }]}>
                    <Text style={{ fontSize: 16, color: "black" }}>clear</Text>
                </TouchableOpacity>


            </View>

            <View style={styles.recordContainer}>
                <Text style={{ fontSize: 22, marginBottom: 15 }}>total: {records.length}</Text>
                <FlatList
                    ref={recordList}
                    style={styles.records}
                    data={records}
                    renderItem={({ item }) => (
                        <Text
                            style={[
                                styles.record,
                                { color: colors[item.type] },
                            ]}
                        >
                            {item.data}
                        </Text>
                    )}
                    keyExtractor={(item) => item.timeStamp}
                    getItemLayout={(data, index) => ({
                        length: 24,
                        offset: 24 * index,
                        index,
                    })}
                />
            </View>

            <View style={styles.timeContainer}>
                {Time}
            </View>

            <View style={styles.btnContainer}>
                {btns.map((b, i) => {
                    return (
                        <TouchableOpacity
                            key={b}
                            style={[styles.btn, { backgroundColor: colors[i] }]}
                            onPress={(e) => {
                                console.log(b);
                                setRecords((pre) => {
                                    const curTime = Date.now();
                                    setTimeout(() => {
                                        recordList.current.scrollToEnd();
                                    }, 100);
                                    return [
                                        ...pre,
                                        {
                                            timeStamp: curTime,
                                            data: `${b},${curTime}`,
                                            type: i,
                                        },
                                    ];
                                });
                            }}
                        >
                            <Text style={{ fontSize: 18 }}>{b}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={[modalStyles.modalContaienr, { height: useWindowDimensions().height - StatusBar.currentHeight - 200 }]}>
                    <View style={modalStyles.header}>
                        <Text style={{ fontSize: 22, fontWeight: "bold" }}>Please select a file to share</Text>
                    </View>
                    <View style={modalStyles.fileList}>
                        <FlatList
                            data={files}
                            renderItem={({ item, i }) => (
                                <View style={{
                                    width: "100%",
                                }}>
                                    <Text
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        style={{
                                            width: "80%",
                                            left: "10%",
                                            height: 36,
                                            backgroundColor: selectedFile === item ? "lightgreen" : "transparent",
                                            textAlign: "center",
                                            textAlignVertical: "center",
                                            fontSize: 16,
                                            borderRadius: 10,
                                        }}
                                        onPress={() => {
                                            setSeletedFile(item);
                                        }}
                                    >
                                        {item}
                                    </Text>
                                </View>
                            )}
                            keyExtractor={(item) => item}
                            getItemLayout={(data, index) => ({
                                length: 36,
                                offset: 36 * index,
                                index,
                            })}
                        />
                    </View>
                    <View style={modalStyles.btns}>
                        <TouchableOpacity
                            style={[modalStyles.btn]}
                            onPress={handleDelete} disabled={selectedFile.length === 0}>
                            <Text>delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modalStyles.btn]}
                            onPress={handleShare} disabled={selectedFile.length === 0}>
                            <Text>share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modalStyles.btn]}
                            onPress={() => { setSeletedFile(''); setModalVisible(false) }}>
                            <Text>cancel</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 0,
        top: StatusBar.currentHeight,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: 'column',
        // backgroundColor: 'aliceblue',
        borderRadius: 20
    },
    outPutContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginVertical: 10
    },
    fileInput: {
        borderBottomWidth: 1,
        borderBottomColor: "gray",
    },
    optionBtn: {
        padding: 7,
        borderRadius: 3
    },
    recordContainer: {
        flex: 6,
        justifyContent: "space-around",
        alignItems: "center",
        height: 400,
        width: "90%",

    },
    records: {
        flex: 1,
    },
    record: {
        fontSize: 16,
        height: 24,
    },
    timeContainer: {
        flex: 2,
        width: "90%",

        justifyContent: "center",
        alignItems: "center",

    },
    text: {
        fontSize: 30,
        color: "black",
    },
    btnContainer: {
        flex: 2,
        flexDirection: "row",
        flexWrap: "wrap",
        width: "90%",
        justifyContent: "space-around",
        alignItems: "center",
    },
    btn: {
        width: 80,
        height: 50,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
});

const modalStyles = StyleSheet.create({
    modalContaienr: {
        marginTop: StatusBar.currentHeight + 200,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 10,
        backgroundColor: "aliceblue"
    },
    header: {
        fontSize: 22,
        // borderBottomColor: "gray",
        // borderBottomWidth: 2,
        padding: 5
    },
    fileList: {
        width: "80%",
        height: "80%",
        marginVertical: 10,
        paddingVertical: 10,
        // backgroundColor: "aliceblue",
        borderRadius: 20
    },
    btns: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 5
    },
    btn: {
        padding: 10
    }
});

export default Home;
