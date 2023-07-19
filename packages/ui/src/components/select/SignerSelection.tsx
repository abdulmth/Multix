import { InputAdornment } from '@mui/material'
import * as React from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import { createFilterOptions } from '@mui/material/Autocomplete'
import { useAccounts } from '../../contexts/AccountsContext'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import AccountDisplay from '../AccountDisplay'
import MultixIdenticon from '../MultixIdenticon'
import { Autocomplete, TextFieldStyled } from '../library'
import OptionMenuItem from './OptionMenuItem'
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete/Autocomplete'

const isInjectedAccountWithMeta = (value: any): value is InjectedAccountWithMeta => {
  return value && value.address && value.meta && value.meta.name
}

interface SignerSelectionProps {
  className?: string
  possibleSigners: string[]
  onChange?: () => void
  inputLabel?: string
}

const getOptionLabel = (option?: NonNullable<InjectedAccountWithMeta | string>): string => {
  if (!option || !isInjectedAccountWithMeta(option)) return ''

  return option.meta.name as string
}

const isOptionEqualToValue = (
  option: InjectedAccountWithMeta | undefined,
  value: InjectedAccountWithMeta | undefined
) => {
  if (!option || !value) return false

  return option.address === value.address
}

const SignerSelection = ({
  className,
  possibleSigners,
  onChange,
  inputLabel
}: SignerSelectionProps) => {
  const { selectAccount, selectedAccount, ownAccountList } = useAccounts()
  const signersList = useMemo(() => {
    return ownAccountList?.filter((account) => possibleSigners.includes(account.address)) || []
  }, [ownAccountList, possibleSigners])

  useEffect(() => {
    if (!selectedAccount || signersList.length === 0) {
      return
    }

    if (!possibleSigners.includes(selectedAccount.address)) {
      selectAccount(signersList[0])
    }
  }, [possibleSigners, selectAccount, selectedAccount, signersList])

  const filterOptions = createFilterOptions({
    ignoreCase: true,
    stringify: (option: typeof selectedAccount) => `${option?.address}${option?.meta.name}` || ''
  })

  const onChangeSigner = useCallback(
    (
      _: React.SyntheticEvent<Element, Event>,
      newSelected: NonNullable<
        | (typeof signersList)[0]
        | string
        | undefined
        | (string | (typeof signersList)[0] | undefined)[]
      >
    ) => {
      isInjectedAccountWithMeta(newSelected) && selectAccount(newSelected)
      onChange && onChange()
    },
    [onChange, selectAccount]
  )

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <TextFieldStyled
      {...params}
      label={inputLabel}
      InputProps={{
        ...params.InputProps,
        startAdornment: (
          <InputAdornment position="start">
            <MultixIdenticon value={selectedAccount?.address} />
          </InputAdornment>
        )
      }}
    />
  )

  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option?: InjectedAccountWithMeta
  ) => {
    if (!option) return null

    return (
      <OptionMenuItem
        {...props}
        keyValue={option.address}
      >
        <AccountDisplay address={option?.address || ''} />
      </OptionMenuItem>
    )
  }

  if (signersList.length === 0) {
    return null
  }

  return (
    <Autocomplete
      isOptionEqualToValue={isOptionEqualToValue}
      disableClearable
      className={className}
      options={signersList}
      filterOptions={filterOptions}
      renderOption={renderOption}
      renderInput={renderInput}
      getOptionLabel={getOptionLabel}
      onChange={onChangeSigner}
      value={selectedAccount || signersList[0]}
    />
  )
}

export default styled(SignerSelection)`
  margin-top: 0.3rem;
`