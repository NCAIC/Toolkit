import { setLocale as set } from "yup";

export function setLocale(lang: "zh") {
    if (lang === "zh") {
        set({
            mixed: {
                required: "缺少 ${path} 欄位",
                oneOf: "${path} 欄位必須為 ${values}",
                notOneOf: "${path} 欄位不可為 ${values}",
                notType: "${path} 欄位必須為 ${type}",
                defined: "缺少 ${path} 欄位",
            },
            string: {
                length: "${path} 欄位長度必須為 ${length}",
                min: "${path} 欄位長度必須大於 ${min}",
                max: "${path} 欄位長度必須小於 ${max}",
                matches: "${path} 欄位必須符合 ${regex}",
                email: "${path} 欄位必須符合 email 格式",
                url: "${path} 欄位必須符合 url 格式",
                uuid: "${path} 欄位必須符合 uuid 格式",
                trim: "${path} 欄位必須符合 trim 格式",
                lowercase: "${path} 欄位必須符合 lowercase 格式",
                uppercase: "${path} 欄位必須符合 uppercase 格式",
            },
            number: {
                min: "${path} 欄位必須大於 ${min}",
                max: "${path} 欄位必須小於 ${max}",
                lessThan: "${path} 欄位必須小於 ${less}",
                moreThan: "${path} 欄位必須大於 ${more}",
                positive: "${path} 欄位必須為正數",
                negative: "${path} 欄位必須為負數",
                integer: "${path} 欄位必須為整數",
            },
            date: {
                min: "${path} 欄位必須大於 ${min}",
                max: "${path} 欄位必須小於 ${max}",
            },
            object: {
                noUnknown: "${path} 欄位必須符合 ${schema}",
            },
            array: {
                length: "${path} 長度必須為 ${length}",
                min: "${path} 長度必須大於 ${min}",
                max: "${path} 長度必須小於 ${max}",
            },
            boolean: {
                isValue: "${path} 欄位必須為 ${value}",
            },
        });
    } else {
        throw new Error("Unsupported language: " + lang);
    }
}
