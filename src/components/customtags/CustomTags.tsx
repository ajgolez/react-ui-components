import {
    Button,
    DropDownButton,
    ButtonProps,
    DropDownButtonProps,
} from '@progress/kendo-react-buttons'
import { forwardRef } from 'react'

export const CustomTags = forwardRef(
    (forwardedRef) => {


        return (
            <>
                <Button title='test' fillMode={'solid'} themeColor={'primary'} size={'small'}>test</Button>
            </>
        )
    }
)