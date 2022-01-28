import React, { useState } from 'react';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { styled } from '@mui/system';
import TitleBox from '@pagopa/selfcare-common-frontend/components/TitleBox';
import { userSelectors } from '@pagopa/selfcare-common-frontend/redux/slices/userSlice';
import { AppError } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { appStateActions } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import withLogin from '@pagopa/selfcare-common-frontend/decorators/withLogin';
import { useAppSelector } from '../../redux/hooks';
import { saveAssistance } from '../../services/assistanceService';
import { LOADING_TASK_SAVE_ASSISTANCE } from '../../utils/constants';
import { useAppDispatch } from './../../redux/hooks';
import ThankyouPage from './ThankyouPage';

export type AssistanceRequest = {
  name?: string;
  surname?: string;
  email?: string;
  emailConfirm?: string;
  message: string;
  messageObject: string;
};

const CustomTextField = styled(TextField)({
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
  '.MuiInput-root': {
    '&:after': {
      borderBottom: '2px solid #5C6F82',
      color: 'green',
    },
  },
  '.MuiInputLabel-root.Mui-focused': {
    color: '#5C6F82',
    fontWeight: '700',
  },
  '.MuiInputLabel-root': {
    color: '#5C6F82',
    fontSize: '14px',
    fontWeight: '700',
  },
  input: {
    color: '#17324D',
    fontSize: '20px',
    fontWeight: '700',
    // textTransform: "capitalize",
    '&::placeholder': {
      color: '#5C6F82',
      opacity: '1',
    },
  },
});
const CustomTextArea = styled(TextField)({
  textarea: {
    fontSize: '16px',
    fontWeight: '400',
    '&::placeholder': {
      fontStyle: 'italic',
      color: '      #5C6F82',
      opacity: '1',
    },
  },
});

const requiredError = 'Required';

const Assistance = () => {
  const [viewThxPage, setThxPage] = useState(false);

  const dispatch = useAppDispatch();
  const addError = (error: AppError) => dispatch(appStateActions.addError(error));
  const setLoading = useLoading(LOADING_TASK_SAVE_ASSISTANCE);

  const user = useAppSelector(userSelectors.selectLoggedUser);

  const validate = (values: Partial<AssistanceRequest>) =>
    Object.fromEntries(
      Object.entries({
        messageObject: !values.messageObject ? requiredError : undefined,
        message: !values.message ? requiredError : undefined,
      }).filter(([_key, value]) => value)
    );

  const formik = useFormik<AssistanceRequest>({
    initialValues: {
      name: user?.name ?? '',
      surname: user?.surname ?? '',
      email: user?.email ?? '',
      emailConfirm: user?.email ?? '',
      message: '',
      messageObject: '',
    },
    validate,
    onSubmit: (values) => {
      setLoading(true);
      saveAssistance(values)
        .then(() => {
          setThxPage(true);
        })
        .catch((reason) =>
          addError({
            id: 'SAVE_ASSISTANCE',
            blocking: false,
            error: reason,
            techDescription: `An error occurred while saving assistance form`,
            toNotify: true,
          })
        )
        .finally(() => setLoading(false));
    },
  });

  const baseTextFieldProps = (
    field: keyof AssistanceRequest,
    label?: string,
    placeholder?: string
  ) => {
    const isError = !!formik.errors[field] && formik.errors[field] !== requiredError;
    return {
      id: field,
      type: 'text',
      value: formik.values[field],
      label,
      placeholder,
      error: isError,
      helperText: isError ? formik.errors[field] : undefined,
      required: true,
      variant: 'standard' as const,
      onChange: formik.handleChange,
      sx: { width: '100%' },
      InputProps: {
        style: {
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          color: '#5C6F82',
          textAlign: 'start' as const,
          paddingLeft: '16px',
        },
      },
    };
  };

  const baseTextAreaProps = (
    field: keyof AssistanceRequest,
    rows: number,
    placeholder?: string,
    maxLength?: number
  ) => {
    const isError = !!formik.errors[field] && formik.errors[field] !== requiredError;
    return {
      multiline: true,
      id: field,
      name: field,
      error: isError,
      rows,
      placeholder,
      sx: { width: '100%' },
      onChange: formik.handleChange,
      inputProps: { maxLength },
    };
  };

  return (
    <React.Fragment>
      {!viewThxPage ? (
        <Box px={24} my={13}>
          <TitleBox
            title="Assistenza"
            subTitle="Come possiamo aiutarti? Compila il modulo e invialo online, ti ricontatteremo al più presto."
            mbTitle={2}
            mbSubTitle={7}
            variantTitle="h1"
            variantSubTitle="h5"
            titleFontSize="48px"
          />
          <form onSubmit={formik.handleSubmit}>
            {/* section visible to logged user */}
            <Box>
              <Grid container direction="column" spacing={3}>
                <Grid container item>
                  <Grid item xs={6} sx={{ height: '75px' }}>
                    <CustomTextField
                      className="messageObject"
                      {...baseTextFieldProps(
                        'messageObject',
                        'Oggetto del messaggio',
                        'Oggetto del messaggio'
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} mb={3} sx={{ height: '75px' }}>
                    <Box sx={{marginTop:'-17px'}}>
                      <Typography variant="body2" sx={{ fontSize: '14px', color:'#5A768A' }}>
                        Indicaci l’argomento della tua richiesta
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Grid container item>
                  <Grid item xs={10}>
                    <Typography variant="h3" sx={{ fontSize: '14px', color: '#5A768A' }} mb={2}>
                      Testo del messaggio
                    </Typography>
                    <CustomTextArea
                      {...baseTextAreaProps(
                        'message',
                        4,
                        'Descrivi qui il motivo della tua richiesta di assistenza',
                        200
                      )}
                    />
                    <Typography variant="body2" sx={{ fontSize: '14px' }} mt={1}>
                      Max 200 caratteri
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Box>

            <Grid container spacing={2} mt={10}>
              <Grid item xs={3}>
                <Button
                  sx={{ width: '100%' }}
                  color="primary"
                  variant="outlined"
                  type="submit"
                  onClick={() => window.location.assign(document.referrer)}
                >
                  Indietro
                </Button>
              </Grid>
              <Grid item xs={3}>
                <Button
                  disabled={!formik.dirty || !formik.isValid}
                  sx={{ width: '100%' }}
                  color="primary"
                  variant="contained"
                  type="submit"
                >
                  Invia
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      ) : (
        <ThankyouPage
          title="Abbiamo ricevuto la tua richiesta"
          description="Ti risponderemo al più presto al tuo indirizzo e-mail istituzionale.
          Grazie per averci contattato."
          onAction={() => window.location.assign(document.referrer)}
        />
      )}
    </React.Fragment>
  );
};

export default withLogin(Assistance);