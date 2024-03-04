import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Input,
  Select,
  Text,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db, getIconType } from 'services';
import { Category, IconType } from 'models';

export const CategoryAdmin = () => {
  const [category, setCategory] = useState('');
  const [translation_en, setTranslation_en] = useState('');
  const [translation_pt, setTranslation_pt] = useState('');
  const [icon, setIcon] = useState('');
  const [iconType, setIconType] = useState<IconType | undefined>(undefined);
  const [categoryList, setCategoryList] = useState<Category[] | undefined>(
    undefined,
  );
  const validIconType = [
    'MaterialCommunityIcons',
    'MaterialIcons',
    'AntDesign',
    'Entypo',
    'Ionicons',
    'Ionicons',
    'Foundation',
    'FontAwesome',
    'FontAwesome5',
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const addCategory = async () => {
    const docRef = doc(db, 'categories', category);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(doc(db, 'categories', category), {
        name: category,
        translation_en: translation_en,
        translation_pt: translation_pt,
        icon: icon,
        iconType: iconType,
      } as Category).then(() => {
        setCategory('');
        setTranslation_en('');
        setTranslation_pt('');
        setIcon('');
        setIconType(undefined);
        loadCategories();
      });
    } else {
      alert('já existe');
    }
  };

  const loadCategories = async () => {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const tempCategories: Category[] = [];
    querySnapshot.forEach((doc) => {
      tempCategories.push(doc.data() as Category);
    });
    setCategoryList(tempCategories);
  };

  const removeCategory = async (name: string) => {
    await deleteDoc(doc(db, 'categories', name)).then(() => loadCategories());
  };

  return (
    <>
      <Input
        variant="unstyled"
        size="lg"
        value={category}
        placeholder="Category Name*"
        onChangeText={setCategory}
      />
      <Input
        variant="unstyled"
        size="lg"
        value={translation_en}
        mt={4}
        placeholder="Translation English"
        onChangeText={setTranslation_en}
      />
      <Input
        variant="unstyled"
        size="lg"
        value={translation_pt}
        mt={4}
        placeholder="Translation Portuguese"
        onChangeText={setTranslation_pt}
      />
      <Input
        variant="unstyled"
        size="lg"
        value={icon}
        mt={4}
        placeholder="Category Icon"
        onChangeText={setIcon}
      />
      <Select
        selectedValue={iconType as string}
        minWidth="200"
        accessibilityLabel="Choose Icon Type"
        placeholder="Choose Icon Type"
        bg="white"
        color="black"
        mt={4}
        onValueChange={(itemValue) => setIconType(itemValue as IconType)}
      >
        {validIconType.map((iconType) => (
          <Select.Item label={iconType} value={iconType} />
        ))}
      </Select>
      {iconType && icon && getIconType(iconType) !== undefined && (
        <Icon
          as={getIconType(iconType)}
          name={icon}
          color="coolGray.800"
          _dark={{
            color: 'warmGray.50',
          }}
        />
      )}
      <Button mt={4} isDisabled={!category} onPress={() => addCategory()}>
        Add Category
      </Button>
      {categoryList && categoryList.length > 0 && (
        <>
          <Heading mt={10} bold>
            Categorias
          </Heading>
          <Box
            mb={10}
            rounded="lg"
            p={6}
            borderColor="coolGray.200"
            borderWidth="1"
            _dark={{
              borderColor: 'coolGray.600',
              backgroundColor: 'gray.700',
            }}
            _web={{
              shadow: 2,
              borderWidth: 0,
              cursor: 'default',
            }}
            _light={{
              backgroundColor: 'gray.50',
            }}
          >
            {categoryList.map((category) => (
              <Flex flexDirection="row" alignItems="center">
                <Icon
                  as={getIconType(category.iconType)}
                  name={category.icon}
                  color="coolGray.800"
                  _dark={{
                    color: 'warmGray.50',
                  }}
                />
                <Text pl={4} fontSize={16} bold>
                  {category.name}
                </Text>
                <Flex flexDirection="row" justifyContent="flex-end" pl={4}>
                  <Button onPress={() => removeCategory(category.name)}>
                    Remove
                  </Button>
                </Flex>
              </Flex>
            ))}
          </Box>
        </>
      )}
    </>
  );
};
