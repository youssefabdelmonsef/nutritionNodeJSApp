/**
 * https://firebase.google.com/docs/functions/typescript
 * to run locally: npm run build => firebase emulators:start
 * to deploy: npm run build => firebase deploy
 * to deploy one function: firebase deploy --only functions:helloWorld
 */

import * as functions from "firebase-functions";
import axios from "axios";
import { edamamNutritionData } from "./config/api-endpoints";
import { appId, appKey } from "./config/app_config";
const cors = require('cors');
const corsHandler = cors({ origin: true });

export const getNutritionData = functions.https.onRequest(async (req, response) => {

    let url = edamamNutritionData;

    let ingredients = req.body.ingredients;

    let ingredientsData: any = [];

    let totalNutritions = {
        calories: {
            unit: '',
            quantity: 0
        },
        fat: {
            unit: '',
            quantity: 0
        },
        cholesterol: {
            unit: '',
            quantity: 0
        },
        sodium: {
            unit: '',
            quantity: 0
        },
        carbohydrate: {
            unit: '',
            quantity: 0
        },
        protein: {
            unit: '',
            quantity: 0
        },
        calcium: {
            unit: '',
            quantity: 0
        },
        iron: {
            unit: '',
            quantity: 0
        },
        potassium: {
            unit: '',
            quantity: 0
        }
    };

    if (ingredients?.length > 0) {
        await ingredients.forEach(async (ing: { quantity: any, unit: any, food: any }, index: number) => {
            let quantity = ing.quantity;
            let unit = ing.unit;
            let food = ing.food;
            try {
                await axios.get(url, {
                    headers: {},
                    params: {
                        app_id: appId,
                        app_key: appKey,
                        ingr: `${quantity} ${unit} ${food}`
                    }
                }).then((res) => {
                    if (res.data?.totalWeight != 0) {
                        let ingredientData = {
                            ...res.data,
                            ingredient: {
                                quantity,
                                unit,
                                food
                            }
                        };
                        ingredientsData.push(ingredientData);

                        totalNutritions.calories.quantity += res.data.calories;

                        totalNutritions.fat.unit = res.data.totalNutrients?.FAT?.unit;
                        totalNutritions.fat.quantity += res.data.totalNutrients?.FAT?.quantity;

                        totalNutritions.cholesterol.unit = res.data.totalNutrients?.CHOLE?.unit;
                        totalNutritions.cholesterol.quantity += res.data.totalNutrients?.CHOLE?.quantity;

                        totalNutritions.sodium.unit = res.data.totalNutrients?.NA?.unit;
                        totalNutritions.sodium.quantity += res.data.totalNutrients?.NA?.quantity;

                        totalNutritions.carbohydrate.unit = res.data.totalNutrients?.SUGAR?.unit;
                        totalNutritions.carbohydrate.quantity += res.data.totalNutrients?.SUGAR?.quantity;

                        totalNutritions.protein.unit = res.data.totalNutrients?.PROCNT?.unit;
                        totalNutritions.protein.quantity += res.data.totalNutrients?.PROCNT?.quantity;

                        totalNutritions.calcium.unit = res.data.totalNutrients?.CA?.unit;
                        totalNutritions.calcium.quantity += res.data.totalNutrients?.CA?.quantity;

                        totalNutritions.iron.unit = res.data.totalNutrients?.FE?.unit;
                        totalNutritions.iron.quantity += res.data.totalNutrients?.FE?.quantity;

                        totalNutritions.potassium.unit = res.data.totalNutrients?.k?.unit;
                        totalNutritions.potassium.quantity += res.data.totalNutrients?.k?.quantity;

                    }
                    if (index + 1 == ingredients.length) {
                        corsHandler(req, response, () => {
                            response.status(200).send({
                                ingredientsData: ingredientsData,
                                totalNutritions: totalNutritions,
                            });
                        });
                    }
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    else {
        corsHandler(req, response, () => {
            response.status(400).send({
                error: 400,
                message: "Missing Entry!",
            });
        });
    }

});