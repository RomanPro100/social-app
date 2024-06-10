import React from 'react'
import {StyleSheet, View} from 'react-native'
import RNPickerSelect, {PickerSelectProps} from 'react-native-picker-select'
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from '@fortawesome/react-native-fontawesome'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useFocusEffect} from '@react-navigation/native'

import {sanitizeAppLanguageSetting} from '#/locale/helpers'
import {useModalControls} from '#/state/modals'
import {useLanguagePrefs, useLanguagePrefsApi} from '#/state/preferences'
import {
  useNativeTranslationDisabled,
  useSetNativeTranslationDisabled,
} from '#/state/preferences/disable-native-translation'
import {useSetMinimalShellMode} from '#/state/shell'
import {APP_LANGUAGES, LANGUAGES} from 'lib/../locale/languages'
import {useAnalytics} from 'lib/analytics/analytics'
import {usePalette} from 'lib/hooks/usePalette'
import {useWebMediaQueries} from 'lib/hooks/useWebMediaQueries'
import {CommonNavigatorParams, NativeStackScreenProps} from 'lib/routes/types'
import {s} from 'lib/styles'
import {Button} from 'view/com/util/forms/Button'
import {ViewHeader} from 'view/com/util/ViewHeader'
import {CenteredView} from 'view/com/util/Views'
import {atoms as a, useBreakpoints, web} from '#/alf'
import {Divider} from '#/components/Divider'
import * as Toggle from '#/components/forms/Toggle'
import {isAvailable as isNativeTranslationAvailable} from '../../../modules/expo-bluesky-translate'
import {Text} from '../com/util/text/Text'
import {ScrollView} from '../com/util/Views'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'LanguageSettings'>

export function LanguageSettingsScreen(_props: Props) {
  const pal = usePalette('default')
  const {_} = useLingui()
  const langPrefs = useLanguagePrefs()
  const setLangPrefs = useLanguagePrefsApi()
  const {isTabletOrDesktop} = useWebMediaQueries()
  const {screen, track} = useAnalytics()
  const setMinimalShellMode = useSetMinimalShellMode()
  const {openModal} = useModalControls()
  const nativeTranslationDisabled = useNativeTranslationDisabled()
  const setNativeTranslationDisabled = useSetNativeTranslationDisabled()
  const {gtMobile} = useBreakpoints()

  useFocusEffect(
    React.useCallback(() => {
      screen('Settings')
      setMinimalShellMode(false)
    }, [screen, setMinimalShellMode]),
  )

  const onPressContentLanguages = React.useCallback(() => {
    track('Settings:ContentlanguagesButtonClicked')
    openModal({name: 'content-languages-settings'})
  }, [track, openModal])

  const onChangePrimaryLanguage = React.useCallback(
    (value: Parameters<PickerSelectProps['onValueChange']>[0]) => {
      if (!value) return
      if (langPrefs.primaryLanguage !== value) {
        setLangPrefs.setPrimaryLanguage(value)
      }
    },
    [langPrefs, setLangPrefs],
  )

  const onChangeAppLanguage = React.useCallback(
    (value: Parameters<PickerSelectProps['onValueChange']>[0]) => {
      if (!value) return
      if (langPrefs.appLanguage !== value) {
        setLangPrefs.setAppLanguage(sanitizeAppLanguageSetting(value))
      }
    },
    [langPrefs, setLangPrefs],
  )

  const myLanguages = React.useMemo(() => {
    return (
      langPrefs.contentLanguages
        .map(lang => LANGUAGES.find(l => l.code2 === lang))
        .filter(Boolean)
        // @ts-ignore
        .map(l => l.name)
        .join(', ')
    )
  }, [langPrefs.contentLanguages])

  return (
    <CenteredView
      style={[
        pal.view,
        pal.border,
        styles.container,
        isTabletOrDesktop && styles.desktopContainer,
      ]}>
      <ViewHeader title={_(msg`Language Settings`)} showOnDesktop showBorder />

      <ScrollView
        contentContainerStyle={[
          a.border_0,
          a.pt_2xl,
          a.px_lg,
          gtMobile && a.px_2xl,
          web({minHeight: '100%'}),
        ]}>
        {/* APP LANGUAGE */}
        <View style={{paddingBottom: 20}}>
          <Text type="title-sm" style={[pal.text, s.pb5]}>
            <Trans>App Language</Trans>
          </Text>
          <Text style={[pal.text, s.pb10]}>
            <Trans>
              Select your app language for the default text to display in the
              app.
            </Trans>
          </Text>

          <View style={{position: 'relative'}}>
            <RNPickerSelect
              placeholder={{}}
              value={sanitizeAppLanguageSetting(langPrefs.appLanguage)}
              onValueChange={onChangeAppLanguage}
              items={APP_LANGUAGES.filter(l => Boolean(l.code2)).map(l => ({
                label: l.name,
                value: l.code2,
                key: l.code2,
              }))}
              style={{
                inputAndroid: {
                  backgroundColor: pal.viewLight.backgroundColor,
                  color: pal.text.color,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  fontWeight: '500',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 24,
                },
                inputIOS: {
                  backgroundColor: pal.viewLight.backgroundColor,
                  color: pal.text.color,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  fontWeight: '500',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 24,
                },

                inputWeb: {
                  cursor: 'pointer',
                  // @ts-ignore web only
                  '-moz-appearance': 'none',
                  '-webkit-appearance': 'none',
                  appearance: 'none',
                  outline: 0,
                  borderWidth: 0,
                  backgroundColor: pal.viewLight.backgroundColor,
                  color: pal.text.color,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  fontWeight: '500',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 24,
                },
              }}
            />

            <View
              style={{
                position: 'absolute',
                top: 1,
                right: 1,
                bottom: 1,
                width: 40,
                backgroundColor: pal.viewLight.backgroundColor,
                borderRadius: 24,
                pointerEvents: 'none',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <FontAwesomeIcon
                icon="chevron-down"
                style={pal.text as FontAwesomeIconStyle}
              />
            </View>
          </View>
        </View>

        <Divider style={{marginBottom: 20}} />

        {/* PRIMARY LANGUAGE */}
        <View style={{paddingBottom: 20}}>
          <Text type="title-sm" style={[pal.text, s.pb5]}>
            <Trans>Primary Language</Trans>
          </Text>
          <Text style={[pal.text, s.pb10]}>
            <Trans>
              Select your preferred language for translations in your feed.
            </Trans>
          </Text>

          <View style={{position: 'relative'}}>
            <RNPickerSelect
              placeholder={{}}
              value={langPrefs.primaryLanguage}
              onValueChange={onChangePrimaryLanguage}
              items={LANGUAGES.filter(l => Boolean(l.code2)).map(l => ({
                label: l.name,
                value: l.code2,
                key: l.code2 + l.code3,
              }))}
              style={{
                inputAndroid: {
                  backgroundColor: pal.viewLight.backgroundColor,
                  color: pal.text.color,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  fontWeight: '500',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 24,
                },
                inputIOS: {
                  backgroundColor: pal.viewLight.backgroundColor,
                  color: pal.text.color,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  fontWeight: '500',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 24,
                },
                inputWeb: {
                  cursor: 'pointer',
                  // @ts-ignore web only
                  '-moz-appearance': 'none',
                  '-webkit-appearance': 'none',
                  appearance: 'none',
                  outline: 0,
                  borderWidth: 0,
                  backgroundColor: pal.viewLight.backgroundColor,
                  color: pal.text.color,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  fontWeight: '500',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 24,
                },
              }}
            />

            <View
              style={{
                position: 'absolute',
                top: 1,
                right: 1,
                bottom: 1,
                width: 40,
                backgroundColor: pal.viewLight.backgroundColor,
                borderRadius: 24,
                pointerEvents: 'none',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <FontAwesomeIcon
                icon="chevron-down"
                style={pal.text as FontAwesomeIconStyle}
              />
            </View>
          </View>
        </View>

        <Divider style={{marginBottom: 20}} />

        {/* CONTENT LANGUAGES */}
        <View style={{paddingBottom: 20}}>
          <Text type="title-sm" style={[pal.text, s.pb5]}>
            <Trans>Content Languages</Trans>
          </Text>
          <Text style={[pal.text, s.pb10]}>
            <Trans>
              Select which languages you want your subscribed feeds to include.
              If none are selected, all languages will be shown.
            </Trans>
          </Text>

          <Button
            type="default"
            onPress={onPressContentLanguages}
            style={styles.button}>
            <FontAwesomeIcon
              icon={myLanguages.length ? 'check' : 'plus'}
              style={pal.text as FontAwesomeIconStyle}
            />
            <Text
              type="button"
              style={[pal.text, {flexShrink: 1, overflow: 'hidden'}]}
              numberOfLines={1}>
              {myLanguages.length ? myLanguages : _(msg`Select languages`)}
            </Text>
          </Button>
        </View>

        {/* NATIVE TRANSLATION */}
        {isNativeTranslationAvailable && (
          <View style={{paddingBottom: 20}}>
            <Divider style={{marginBottom: 20}} />

            <Text type="title-sm" style={[pal.text, s.pb5]}>
              <Trans>Native Translations</Trans>
            </Text>
            <Text style={[pal.text, s.pb10]}>
              <Trans>
                Translations are provided the operating system, where available.
                Unfortuntely, the number of languages supported by this feature
                is limited, so you may want to disable this and fall back to
                opening a translation in your web browser.
              </Trans>
            </Text>

            <Toggle.Group
              label={_(msg`Enable native translation`)}
              type="radio"
              values={[nativeTranslationDisabled ? 'disabled' : 'enabled']}
              onChange={value =>
                setNativeTranslationDisabled(
                  value[0] === 'enabled' ? false : true,
                )
              }>
              <View style={[a.gap_sm, a.py_sm]}>
                <Toggle.Item name="enabled" label={_(msg`Enabled`)}>
                  <Toggle.Radio />
                  <Toggle.LabelText>
                    <Trans>Enabled</Trans>
                  </Toggle.LabelText>
                </Toggle.Item>
                <Toggle.Item name="disabled" label={_(msg`Disabled`)}>
                  <Toggle.Radio />
                  <Toggle.LabelText>
                    <Trans>Disabled</Trans>
                  </Toggle.LabelText>
                </Toggle.Item>
              </View>
            </Toggle.Group>
          </View>
        )}
      </ScrollView>
    </CenteredView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 90,
  },
  desktopContainer: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingBottom: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
})
